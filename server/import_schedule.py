import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

# Add the server directory to python path if it isn't already
sys.path.insert(0, str(Path(__file__).resolve().parent))

from db import db_cursor


class LEOHTMLTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_thead = False
        self.in_row = False
        self.in_cell = False
        self.headers = []
        self.rows = []
        self.current_row = []
        self.current_cell_data = ""

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.in_table = True
        elif tag == "thead":
            self.in_thead = True
        elif tag == "tr" and self.in_table:
            self.in_row = True
            self.current_row = []
        elif (tag == "td" or tag == "th") and self.in_row:
            self.in_cell = True
            self.current_cell_data = ""

    def handle_endtag(self, tag):
        if tag == "table":
            self.in_table = False
        elif tag == "thead":
            self.in_thead = False
        elif tag == "tr" and self.in_row:
            self.in_row = False
            if self.in_thead:
                self.headers = [h.strip() for h in self.current_row]
            else:
                self.rows.append([c.strip() for c in self.current_row])
        elif (tag == "td" or tag == "th") and self.in_cell:
            self.in_cell = False
            self.current_row.append(self.current_cell_data.strip())

    def handle_data(self, data):
        if self.in_cell:
            self.current_cell_data += data


def split_subject_name(full_name: str):
    """Splits subject name like 'Computer Programming (การเขียนโปรแกรมคอมพิวเตอร์)'
    into English name and Thai name."""
    match = re.match(r"([^(]+)\s*\(([^)]+)\)", full_name)
    if match:
        return match.group(1).strip(), match.group(2).strip()
    return full_name.strip(), ""


def parse_class_schedule(html_content: str):
    parser = LEOHTMLTableParser()
    parser.feed(html_content)
    
    schedule_data = []
    # Columns expected: รหัสวิชา, ชื่อวิชา, กลุ่ม (Sec), วันเรียน, เวลาเรียน, ห้องเรียน, ผู้สอน
    for row in parser.rows:
        if len(row) < 7:
            continue
        
        course_id = row[0]
        full_name = row[1]
        section = row[2]
        day = row[3]
        time_str = row[4]
        room = row[5]
        instructor = row[6]
        
        name_en, name_th = split_subject_name(full_name)
        if not name_th:
            name_th = name_en
            
        time_start, time_end = "", ""
        if "-" in time_str:
            parts = time_str.split("-")
            time_start = parts[0].strip()
            time_end = parts[1].strip()
            
        schedule_data.append({
            "course_id": course_id,
            "course_name_th": name_th,
            "course_name_en": name_en,
            "section": section,
            "day": day,
            "time_start": time_start,
            "time_end": time_end,
            "room": room,
            "instructor": instructor
        })
    return schedule_data


def parse_exam_schedule(html_content: str):
    parser = LEOHTMLTableParser()
    parser.feed(html_content)
    
    exam_data = []
    # Columns expected: รหัสวิชา, ชื่อวิชา, ประเภทการสอบ, วันที่สอบ, เวลาสอบ, ห้องสอบ, ที่นั่งสอบ
    for row in parser.rows:
        if len(row) < 7:
            continue
            
        course_id = row[0]
        full_name = row[1]
        exam_type = row[2]
        date_str = row[3]
        time_str = row[4]
        room = row[5]
        seat_no = row[6]
        
        name_en, name_th = split_subject_name(full_name)
        if not name_th:
            name_th = name_en
            
        time_start, time_end = "", ""
        if "-" in time_str:
            parts = time_str.split("-")
            time_start = parts[0].strip()
            time_end = parts[1].strip()
            
        exam_data.append({
            "course_id": course_id,
            "course_name_th": name_th,
            "course_name_en": name_en,
            "exam_type": exam_type,
            "date": date_str,
            "time_start": time_start,
            "time_end": time_end,
            "room": room,
            "seat_no": seat_no
        })
    return exam_data


def save_to_db(kind: str, year: int, term: int, data: list):
    with db_cursor() as conn:
        # Delete existing data for the same kind, year, term to prevent duplicates
        conn.execute(
            "DELETE FROM schedules WHERE kind = ? AND year = ? AND term = ?",
            (kind, year, term)
        )
        # Insert new data as separate rows
        for item in data:
            if kind == "class":
                day_or_date = item.get("day")
                instructor_or_seat = item.get("instructor")
            else:
                day_or_date = item.get("date")
                instructor_or_seat = item.get("seat_no")

            conn.execute(
                """
                INSERT INTO schedules (
                    kind, year, term, course_id, course_name_th, course_name_en, 
                    section, day_or_date, time_start, time_end, room, instructor_or_seat
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    kind,
                    year,
                    term,
                    item.get("course_id"),
                    item.get("course_name_th"),
                    item.get("course_name_en"),
                    item.get("section"),
                    day_or_date,
                    item.get("time_start"),
                    item.get("time_end"),
                    item.get("room"),
                    instructor_or_seat
                )
            )
    print(f"Successfully imported {kind} schedule for year {year} term {term} ({len(data)} items)")


def main():
    base_dir = Path(__file__).resolve().parent
    
    # 1. Parse Class Schedule
    class_html_path = base_dir / "static" / "mocks" / "leo_class_schedule.html"
    if class_html_path.exists():
        html_content = class_html_path.read_text(encoding="utf-8")
        class_data = parse_class_schedule(html_content)
        save_to_db(kind="class", year=2026, term=1, data=class_data)
    else:
        print(f"Error: {class_html_path} not found")

    # 2. Parse Exam Schedule
    exam_html_path = base_dir / "static" / "mocks" / "leo_exam_schedule.html"
    if exam_html_path.exists():
        html_content = exam_html_path.read_text(encoding="utf-8")
        exam_data = parse_exam_schedule(html_content)
        save_to_db(kind="exam", year=2026, term=1, data=exam_data)
    else:
        print(f"Error: {exam_html_path} not found")


if __name__ == "__main__":
    main()

# Dev sample data. Run: python seed.py  (after `python db.py`)
from pathlib import Path
from db import db_cursor


def main() -> None:
    with db_cursor() as conn:
        # Seed rooms
        conn.executemany(
            "INSERT OR IGNORE INTO rooms(name, description) VALUES (?,?)",
            [("113", "ห้องเรียน CE"), ("Server Room", "ห้องเซิร์ฟเวอร์สาขา")],
        )

        # Seed videos
        conn.executemany(
            "INSERT OR IGNORE INTO videos(title, description, file_path, year) VALUES (?,?,?,?)",
            [("Footage_CE04", "Footage ห้อง CE04", "/Video/Footage_CE04.mp4", 2025)],
        )

        # Seed teachers
        teachers_data = [
            ("อาจารย์อรรถศาสตร์ นาคเทวัญ", "Athasart Narkthewan", "athasart.webp", '["1"]'),
            ("ดร.รัตติกร สมบัติแก้ว", "Rattikorn Sombutkaew", "rattikorn.webp", '["2"]'),
            ("อาจารย์นภัสรพี สิทธิวัจน์", "Pisakorn Sittiwatjana", "pisakorn.webp", '["3"]'),
            ("ว่าที่ร้อยตรี ศิลา ศิริมาสกุล", "Silar Sirimasakul", "silar.webp", '["4"]'),
            ("อาจารย์สกาวกาญจน์ ปิยะวิทย์วนิช", "Sakawkarn Piyawitwanich", "sakawkarn.webp", '["1", "2"]'),
            ("นายจตุรงค์ เกตุนิมิต", "Jaturong Katenimit", "jaturong.webp", '[]')
        ]

        for name_th, name_en, photo_filename, advise_years in teachers_data:
            photo_path = f"/image/{photo_filename}"
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM teachers WHERE name_th = ?", (name_th,))
            row = cursor.fetchone()
            if row:
                cursor.execute(
                    "UPDATE teachers SET name_en = ?, photo = ?, advise_years = ? WHERE id = ?",
                    (name_en, photo_path, advise_years, row[0])
                )
            else:
                cursor.execute(
                    "INSERT INTO teachers (name_th, name_en, photo, advise_years) VALUES (?, ?, ?, ?)",
                    (name_th, name_en, photo_path, advise_years)
                )

        # Seed students
        students_data = [
            ("65010001", "นายณัฐพงษ์ แก้วดี", "Nattapong Kaewdee", "/image/std1.png", 4, "หัวหน้าห้อง (Leader)", "CE04-A", "nattapong@ce.ac.th"),
            ("65010002", "นางสาวศิริพร สมบูรณ์", "Siriporn Somboon", "/image/std2.png", 4, "เหรัญญิก (Treasurer)", "CE04-B", "siriporn@ce.ac.th"),
            ("66010001", "นายสมชาย ทรงจำ", "Somchai Songjam", "/image/std3.png", 3, "หัวหน้าห้อง (Leader)", "CE05-A", "somchai.s@ce.ac.th"),
            ("66010002", "นางสาวกานดา รักเรียน", "Kanda Rakrian", "/image/std4.png", 3, "เลขานุการ (Secretary)", "CE05-B", "kanda@ce.ac.th"),
            ("67010001", "นายปกรณ์ เจริญชัย", "Pakorn Charoenchai", "/image/std5.png", 2, "หัวหน้าห้อง (Leader)", "CE06-A", "pakorn@ce.ac.th"),
            ("67010002", "นางสาวอลิสา สวยงาม", "Alisa Suayngam", "/image/std6.png", 2, "ประชาสัมพันธ์ (PR)", "CE06-B", "alisa@ce.ac.th"),
        ]

        for std_id, name_th, name_en, photo, year, role, track, contact in students_data:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM students WHERE student_id = ?", (std_id,))
            row = cursor.fetchone()
            if row:
                cursor.execute(
                    "UPDATE students SET name_th = ?, name_en = ?, photo = ?, year = ?, class_role = ?, track = ?, contact = ? WHERE student_id = ?",
                    (name_th, name_en, photo, year, role, track, contact, std_id)
                )
            else:
                cursor.execute(
                    "INSERT INTO students (student_id, name_th, name_en, photo, year, class_role, track, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (std_id, name_th, name_en, photo, year, role, track, contact)
                )
                
    print("seeded")



if __name__ == "__main__":
    main()
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from db import db_cursor, init_db
from auth_utils import hash_password


def main() -> None:
    init_db()
    with db_cursor() as conn:
        # Wipe all existing table data & reset autoincrement sequences
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = OFF")
        tables = [
            "users", "teachers", "students", "works", "news_items",
            "class_schedules", "exam_schedules", "rooms",
            "internship_topics", "internship_students", "videos"
        ]
        for tbl in tables:
            cursor.execute(f"DELETE FROM {tbl}")
            cursor.execute("DELETE FROM sqlite_sequence WHERE name = ?", (tbl,))
        cursor.execute("PRAGMA foreign_keys = ON")

        # Seed users
        users_data = [
            ("superadmin", hash_password("super1234"), "superadmin@ce.ac.th", "Super Admin", "superadmin", 0),
            ("admin_y1", hash_password("admin1234"), "admin_y1@ce.ac.th", "Admin Year 1", "admin", 1),
            ("writer_y1", hash_password("writer1234"), "writer_y1@ce.ac.th", "Writer Year 1", "writer", 1),
        ]
        for username, password_hash, email, full_name, role, year in users_data:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
            row = cursor.fetchone()
            if row:
                cursor.execute(
                    "UPDATE users SET password_hash = ?, email = ?, full_name = ?, role = ?, year = ? WHERE id = ?",
                    (password_hash, email, full_name, role, year, row[0])
                )
            else:
                cursor.execute(
                    "INSERT INTO users (username, password_hash, email, full_name, role, year) VALUES (?, ?, ?, ?, ?, ?)",
                    (username, password_hash, email, full_name, role, year)
                )

        # Seed rooms
        conn.executemany(
            "INSERT OR IGNORE INTO rooms(name, description) VALUES (?,?)",
            [("113", "ห้องเรียน CE"), ("Server Room", "ห้องเซิร์ฟเวอร์สาขา")],
        )

        # Seed videos
        conn.executemany(
            "INSERT OR IGNORE INTO videos(title, description, file_path, year) VALUES (?,?,?,?)",
            [("Footage_CE04", "Footage ห้อง CE04", "/Video/ce_hero_footage.mp4", 2025)],
        )

        # Seed teachers
        teachers_data = [
            ("อาจารย์อรรถศาสตร์ นาคเทวัญ", "Athasart Narkthewan", "athasart.webp", '["1"]', "athasart.na@kmitl.ac.th"),
            ("ดร.รัตติกร สมบัติแก้ว", "Rattikorn Sombutkaew", "rattikorn.webp", '["2"]', "rattikorn.so@kmitl.ac.th"),
            ("อาจารย์นภัสรพี สิทธิวัจน์", "Pisakorn Sittiwatjana", "pisakorn.webp", '["3"]', "pisakorn.si@kmitl.ac.th"),
            ("ว่าที่ร้อยตรี ศิลา ศิริมาสกุล", "Silar Sirimasakul", "silar.webp", '["4"]', "silar.si@kmitl.ac.th"),
            ("อาจารย์สกาวกาญจน์ ปิยะวิทย์วนิช", "Sakawkarn Piyawitwanich", "sakawkarn.webp", '["1", "2"]', "sakawkarn.pi@kmitl.ac.th"),
            ("นายจตุรงค์ เกตุนิมิต", "Jaturong Katenimit", "jaturong.webp", '[]', "jaturong.k@ce.ac.th")
        ]

        for name_th, name_en, photo_filename, advise_years, contact in teachers_data:
            photo_path = f"/image/professors/{photo_filename}"
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM teachers WHERE name_th = ?", (name_th,))
            row = cursor.fetchone()
            if row:
                cursor.execute(
                    "UPDATE teachers SET name_en = ?, photo = ?, advise_years = ?, contact = ? WHERE id = ?",
                    (name_en, photo_path, advise_years, contact, row[0])
                )
            else:
                cursor.execute(
                    "INSERT INTO teachers (name_th, name_en, photo, advise_years, contact) VALUES (?, ?, ?, ?, ?)",
                    (name_th, name_en, photo_path, advise_years, contact)
                )

        # Seed students — mirror server/students.csv
        csv_file = Path(__file__).resolve().parent / "students.csv"
        if csv_file.exists():
            from import_students import import_students_csv
            import_students_csv(csv_file)
        else:
            students_data = [
                ("67200412", "นายรุจิณัฐ อาศิรเมธี", "Mr. Rujinat Asirametee", "/image/students/ce04/67200412.png", 3, "", "006", "Tel: 0800479886 | IG: @Rujinat_Fah"),
                ("67200014", "นางสาวกัณฐมณี กอบการ", "Miss Kantamanee Kobkarn", "/image/students/ce04/67200014.png", 3, "เลขา", "339", "Tel: 0875732080 | IG: @kwin_mhy"),
                ("67200099", "นายทัชภูมิ ใจดี", "Mr. Thatchaphum Jaidee", "/image/students/ce04/67200099.png", 3, "", "787", "Tel: 0986782950 | IG: @pipe2bot"),
                ("67200049", "นายเจษฎา ศรีสง่า", "Mr. Jetsada Srisanga", "/image/students/ce04/67200049.png", 3, "ประธานชั้นปีที่3", "538", "Tel: 0626253837 | IG: @p_Jetsada_p"),
                ("67200102", "นายทีปกิติ์ พรหมสัตยพรต", "Mr. Teepakit Phormmasattayaprot", "/image/students/ce04/67200102.png", 3, "", "444", "Tel: 0973016465 | IG: @lil_weirx"),
                ("67200350", "นางสาวณัฏฐ์ชยา จำปา", "Miss Natchaya Champa", "/image/students/ce04/67200350.png", 3, "เหรัญญิก", "123", "Tel: 0985364534 | IG: @Waa_.zz"),
                ("67200235", "นางสาวรินรดา บุญมี", "Miss Rinrada Boonmee", "/image/students/ce04/67200235.png", 3, "", "800", "Tel: 0937764085 | IG: @nnoey.rb"),
                ("67200079", "นางสาวณัฐธิดา เกื้อประจง", "Miss Natthida Kueaprajong", "/image/students/ce04/67200079.png", 3, "เหรัญญิก", "007", "Tel: 0801585306 | IG: @ntd.axn"),
                ("67200223", "นายมีสุข เอกพงษ์", "Mr. Misuk Aekkaphong", "/image/students/ce04/67200223.png", 3, "", "800", "Tel: 0831508487 | IG: @Messily ekkaphong"),
                ("67200369", "นายธีรศาสนต์ คงเกิด", "Mr. Thirasan Khongkoed", "/image/students/ce04/67200369.png", 3, "", "800", "Tel: 0656709042 | IG: @Teeuytee"),
                ("67200030", "นายคณพัฒน์ รุ่งรพีพรพงษ์", "Mr. Kanaphat Rungrapeepornpong", "/image/students/ce04/67200030.png", 3, "รองประธานสาขา", "224", "Tel: 0810247384 | IG: @pooh_2134"),
                ("67200093", "นายตระกูลชัย เเซ่ติ้ง", "Mr. trakoonchai saeting", "/image/students/ce04/67200093.png", 3, "", "006", "Tel: 0980850838 | IG: NULL"),
                ("67200324", "นายกนกพัฒน์ โพธิ", "Mr. Kanokphat Pothi", "/image/students/ce04/67200324.png", 3, "", "444", "Tel: 0926577824 | IG: @lxo_xelxeoo"),
                ("67200348", "นายณรงค์รักษ์ เรืองศักดิ์", "Mr. Narongrak Rueangsak", "/image/students/ce04/67200348.png", 3, "", "999", "Tel: 0929744516 | IG: @ainxri"),
                ("67200380", "นายปรินทร คงทอง", "Mr. Parinthon Kongthong", "/image/students/ce04/67200380.png", 3, "", "339", "Tel: 0631102883 | IG: @bank.parinthon"),
            ]

            for std_id, name_th, name_en, photo, year, role, track, contact in students_data:
                photo_path = photo or f"/image/students/ce04/{std_id}.png"
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM students WHERE student_id = ?", (std_id,))
                row = cursor.fetchone()
                if row:
                    cursor.execute(
                        "UPDATE students SET name_th = ?, name_en = ?, photo = ?, year = ?, class_role = ?, track = ?, contact = ? WHERE student_id = ?",
                        (name_th, name_en, photo_path, year, role, track, contact, std_id)
                    )
                else:
                    cursor.execute(
                        "INSERT INTO students (student_id, name_th, name_en, photo, year, class_role, track, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (std_id, name_th, name_en, photo_path, year, role, track, contact)
                    )

        # Seed works from Work.csv
        works_csv_file = Path(__file__).resolve().parent / "Work.csv"
        if works_csv_file.exists():
            from import_works import import_works_csv
            import_works_csv(works_csv_file, conn=conn)

        # Seed news from News-CE.csv
        news_csv_file = Path(__file__).resolve().parent / "News-CE.csv"
        if news_csv_file.exists():
            from import_news import import_news_csv
            import_news_csv(news_csv_file, conn=conn)

        # Seed GNews global news if API Key is set
        from config import GNEWS_API_KEY, GNEWS_QUERY
        from services import gnews
        if GNEWS_API_KEY:
            try:
                gnews.sync(conn, GNEWS_API_KEY, GNEWS_QUERY)
            except Exception as e:
                print(f"[Warning] GNews sync in seed failed: {e}")

        # Seed class schedules for Year 1-4
        schedules_all = [
            # Year 1 Term 1
            (1, 1, "monday", "09:00 - 12:00", "01006001", "Calculus 1 (Lecture)", "แคลคูลัส 1 (ทฤษฎี)", "B 217", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            (1, 1, "tuesday", "09:00 - 12:00", "01006002", "Computer Programming (Lecture)", "การโปรแกรมคอมพิวเตอร์ (ทฤษฎี)", "B 218", "Athasart Narkthewan", "อ. อรรถศาสตร์ นาคเทวัญ"),
            (1, 1, "tuesday", "13:00 - 16:00", "01006002-LAB", "Computer Programming (Lab)", "การโปรแกรมคอมพิวเตอร์ (ปฏิบัติ)", "B 218 ป.คอมพิวเตอร์1", "Athasart Narkthewan", "อ. อรรถศาสตร์ นาคเทวัญ"),
            (1, 1, "thursday", "13:00 - 16:00", "01006003", "Physics for Engineers (Lecture)", "ฟิสิกส์สำหรับวิศวกร (ทฤษฎี)", "E 107", "Silar Sirimasakul", "อ. ศิลา ศิริมาสกุล"),
            
            # Year 2 Term 1
            (2, 1, "monday", "09:00 - 12:00", "02006010", "Data Structures & Algorithms (Lecture)", "โครงสร้างข้อมูลและอัลกอริทึม (ทฤษฎี)", "B 218", "Pisakorn Sittiwatjana", "อ. นภัสรพี สิทธิวัจน์"),
            (2, 1, "monday", "13:00 - 16:00", "02006010-LAB", "Data Structures & Algorithms (Lab)", "โครงสร้างข้อมูลและอัลกอริทึม (ปฏิบัติ)", "B 218 ป.คอมพิวเตอร์1", "Pisakorn Sittiwatjana", "อ. นภัสรพี สิทธิวัจน์"),
            (2, 1, "wednesday", "09:00 - 12:00", "02006011", "Digital Logic Design (Lecture)", "การออกแบบดิจิทัลลอจิก (ทฤษฎี)", "B 217", "Silar Sirimasakul", "อ. ศิลา ศิริมาสกุล"),
            (2, 1, "wednesday", "13:00 - 16:00", "02006011-LAB", "Digital Logic Design (Lab)", "การออกแบบดิจิทัลลอจิก (ปฏิบัติ)", "B 217", "Silar Sirimasakul", "อ. ศิลา ศิริมาสกุล"),
            
            # Year 3 Term 1
            (3, 1, "monday", "10:00 - 12:00", "11256011", "Software Development Processes (Lecture)", "SOFTWARE DEVELOPMENT PROCESSES (ทฤษฎี)", "E 107", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            (3, 1, "monday", "13:00 - 16:00", "11256011-LAB", "Software Development Processes (Lab)", "SOFTWARE DEVELOPMENT PROCESSES (ปฏิบัติ)", "B 218 ป.คอมพิวเตอร์1", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            (3, 1, "monday", "18:00 - 20:00", "90642172", "Team-Project 2 (Lab)", "TEAM-PROJECT 2 (ปฏิบัติ)", "E 111", "Pisakorn Sittiwatjana", "อ. นภัสรพี สิทธิวัจน์"),
            (3, 1, "tuesday", "10:00 - 12:00", "11256016", "Database Systems (Lecture)", "DATABASE SYSTEMS (ทฤษฎี)", "B 218 ป.คอมพิวเตอร์1", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            (3, 1, "tuesday", "13:00 - 16:00", "11256016-LAB", "Database Systems (Lab)", "DATABASE SYSTEMS (ปฏิบัติ)", "B 218 ป.คอมพิวเตอร์1", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            (3, 1, "wednesday", "10:00 - 12:00", "11256027", "Computer Hardware Design (Lecture)", "COMPUTER HARDWARE DESIGN (ทฤษฎี)", "B 217", "Silar Sirimasakul", "อ. ศิลา ศิริมาสกุล"),
            (3, 1, "wednesday", "13:00 - 16:00", "11256022-LAB", "Information and Computer Security (Lab)", "INFORMATION AND COMPUTER SECURITY (ปฏิบัติ)", "B 218 ป.คอมพิวเตอร์1", "Athasart Narkthewan", "อ. อรรถศาสตร์ นาคเทวัญ"),
            (3, 1, "wednesday", "16:00 - 18:00", "11256022", "Information and Computer Security (Lecture)", "INFORMATION AND COMPUTER SECURITY (ทฤษฎี)", "B 218 ป.คอมพิวเตอร์1", "Athasart Narkthewan", "อ. อรรถศาสตร์ นาคเทวัญ"),
            (3, 1, "thursday", "09:00 - 12:00", "11256027-LAB", "Computer Hardware Design (Lab)", "COMPUTER HARDWARE DESIGN (ปฏิบัติ)", "B 217", "Silar Sirimasakul", "อ. ศิลา ศิริมาสกุล"),
            (3, 1, "thursday", "17:00 - 20:00", "11256025-LAB", "Computer Architecture (Lab)", "COMPUTER ARCHITECTURE (ปฏิบัติ)", "E 107", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            (3, 1, "friday", "10:00 - 12:00", "11256025", "Computer Architecture (Lecture)", "COMPUTER ARCHITECTURE (ทฤษฎี)", "E 111", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),

            # Year 4 Term 1
            (4, 1, "tuesday", "09:00 - 12:00", "04006020", "Senior Project I", "โครงงานวิศวกรรมคอมพิวเตอร์ 1", "E 111", "Sakawkarn Piyawitwanich", "อ. สกาวกาญจน์ ปิยะวิทย์วนิช"),
            (4, 1, "thursday", "13:00 - 16:00", "04006021", "Cloud Computing & DevOps", "คลาวด์คอมพิวติ้งและเดฟออปส์", "B 218", "Athasart Narkthewan", "อ. อรรถศาสตร์ นาคเทวัญ"),
        ]

        cursor = conn.cursor()
        cursor.execute("DELETE FROM class_schedules")
        for yr, trm, day, raw_time_slot, code, name_en, name_th, room, instr_en, instr_th in schedules_all:
            start_str, end_str = [s.strip() for s in raw_time_slot.split("-")]
            start_h = int(start_str.split(":")[0])
            end_h = int(end_str.split(":")[0])
            for h in range(start_h, end_h):
                time_slot = f"{h:02d}:00 - {h+1:02d}:00"
                cursor.execute(
                    "INSERT INTO class_schedules (year, term, day, time_slot, code, name_en, name_th, room, instructor_en, instructor_th) "
                    "VALUES (?,?,?,?,?,?,?,?,?,?)",
                    (yr, trm, day, time_slot, code, name_en, name_th, room, instr_en, instr_th),
                )

        # Seed exam schedules for Year 1-4
        exams_all = [
            # Year 1
            (1, 1, "01006001", "Calculus 1", "แคลคูลัส 1", "2026-08-20", "09:00", "12:00", "Thu 20 Aug 2026", "พฤหัสบดี 20 ส.ค. 2569", "Thu 29 Oct 2026", "พฤหัสบดี 29 ต.ค. 2569"),
            (1, 1, "01006002", "Computer Programming", "การโปรแกรมคอมพิวเตอร์", "2026-08-22", "09:00", "12:00", "Sat 22 Aug 2026", "เสาร์ 22 ส.ค. 2569", "Sat 31 Oct 2026", "เสาร์ 31 ต.ค. 2569"),

            # Year 2
            (2, 1, "02006010", "Data Structures & Algorithms", "โครงสร้างข้อมูลและอัลกอริทึม", "2026-08-20", "13:30", "16:30", "Thu 20 Aug 2026", "พฤหัสบดี 20 ส.ค. 2569", "Thu 29 Oct 2026", "พฤหัสบดี 29 ต.ค. 2569"),

            # Year 3
            (3, 1, "11256011", "Software Development Processes", "SOFTWARE DEVELOPMENT PROCESSES", "2026-08-23", "13:30", "16:30", "Sun 23 Aug 2026 (13:30 - 16:30)", "อาทิตย์ 23 ส.ค. 2569 (13:30 - 16:30)", "Tue 3 Nov 2026 (13:30 - 16:30)", "อังคาร 3 พ.ย. 2569 (13:30 - 16:30)"),
            (3, 1, "11256016", "Database Systems", "DATABASE SYSTEMS", "2026-08-21", "13:30", "16:30", "Fri 21 Aug 2026 (13:30 - 16:30)", "ศุกร์ 21 ส.ค. 2569 (13:30 - 16:30)", "Fri 30 Oct 2026 (13:30 - 16:30)", "ศุกร์ 30 ต.ค. 2569 (13:30 - 16:30)"),
            (3, 1, "11256022", "Information and Computer Security", "INFORMATION AND COMPUTER SECURITY", "2026-10-26", "13:30", "16:30", "Arranged by Lecturer", "จัดสอบเอง", "Mon 26 Oct 2026 (13:30 - 16:30)", "จันทร์ 26 ต.ค. 2569 (13:30 - 16:30)"),
            (3, 1, "11256025", "Computer Architecture", "COMPUTER ARCHITECTURE", "2026-08-19", "13:30", "16:30", "Wed 19 Aug 2026 (13:30 - 16:30)", "พุธ 19 ส.ค. 2569 (13:30 - 16:30)", "Wed 28 Oct 2026 (13:30 - 16:30)", "พุธ 28 ต.ค. 2569 (13:30 - 16:30)"),
            (3, 1, "11256027", "Computer Hardware Design", "COMPUTER HARDWARE DESIGN", "2026-11-04", "13:30", "16:30", "Arranged by Lecturer", "จัดสอบเอง", "Wed 4 Nov 2026 (13:30 - 16:30)", "พุธ 4 พ.ย. 2569 (13:30 - 16:30)"),
            (3, 1, "90642172", "Team-Project 2", "TEAM-PROJECT 2", "9999-12-31", "-", "-", "Arranged by Lecturer", "จัดสอบเอง", "Arranged by Lecturer", "จัดสอบเอง"),

            # Year 4
            (4, 1, "04006020", "Senior Project I", "โครงงานวิศวกรรมคอมพิวเตอร์ 1", "9999-12-31", "-", "-", "Arranged by Lecturer", "จัดสอบเอง", "Arranged by Lecturer", "จัดสอบเอง"),
        ]
        cursor = conn.cursor()
        cursor.execute("DELETE FROM exam_schedules")
        for yr, trm, code, name_en, name_th, date_raw, start_time, end_time, mid_en, mid_th, fin_en, fin_th in exams_all:
            cursor.execute(
                "INSERT INTO exam_schedules "
                "(year, term, code, name_en, name_th, date_raw, start_time, end_time, midterm_en, midterm_th, finals_en, finals_th) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                (yr, trm, code, name_en, name_th, date_raw, start_time, end_time, mid_en, mid_th, fin_en, fin_th),
            )

        # Seed student internship records
        internship_students_data = [
            (
                "intern-1",
                "นายภาณุวัฒน์ เด่นชัย (CE#49)",
                "Panuwat Denchai (CE#49)",
                "Agoda Services Co., Ltd.",
                "Software Engineer Intern",
                "Software Engineer Intern",
                "Software & Distributed Systems",
                "/internship/student1.jpg",
                "มิ.ย. - ส.ค. 2025",
                "June - Aug 2025",
                "ร่วมพัฒนา Microservices สำหรับระบบจองโรงแรมสเกลใหญ่ รองรับการประมวลผลข้อมูลนับล้านคำขอต่อวัน",
                "Developed high-concurrency microservices for hotel booking engines processing millions of daily requests.",
                "ได้รับโอกาสทำงานจริงร่วมกับทีม Booking Engine ในการ Optimize SQL queries และพัฒนา gRPC services ด้วย Go และ Scala ช่วยลด latency ของระบบสตรีมข้อมูลผลการค้นหาห้องพักลง 25%",
                "Worked directly with the Booking Engine team optimizing SQL queries and developing gRPC services in Go and Scala, reducing search results latency by 25%.",
                json.dumps(["Go", "gRPC", "Scala", "Kubernetes", "PostgreSQL", "Kafka"], ensure_ascii=False),
                "เตรียมความพร้อมเรื่อง Data Structures, System Design และทักษะภาษาอังกฤษ จะช่วยได้มากในการสัมภาษณ์งาน",
                "Strengthen Data Structures, System Design concepts, and English communication skills for technical interviews.",
                "800 - 1,200 บาท / วัน (ประมาณ 20,000 - 26,000 บาท/เดือน)",
                "800 - 1,200 THB / day (approx. 20,000 - 26,000 THB/month)",
                json.dumps([
                    "MacBook Pro M3 Pro สำหรับใช้งานตลอดการฝึกงาน",
                    "ฟรีอาหารกลางวัน Buffet & เครื่องดื่มในออฟฟิศ",
                    "ประกันสุขภาพกลุ่ม และประกันอุบัติเหตุ",
                    "Hybrid Working (เข้าออฟฟิศ 2 วัน/สัปดาห์)",
                    "งบสนับสนุนการเรียนออนไลน์ Coursera & Udemy Unlimited"
                ], ensure_ascii=False),
                json.dumps([
                    "MacBook Pro M3 Pro laptop provided",
                    "Free Daily Buffet Lunch & Drinks",
                    "Group Health & Accident Insurance",
                    "Hybrid Working (2 Days in office)",
                    "Coursera & Udemy Unlimited Skill Budget"
                ], ensure_ascii=False),
                5.0
            ),
            (
                "intern-2",
                "นางสาวศิริพร บุญเหลือ (CE#49)",
                "Siriporn Boonlue (CE#49)",
                "KBTG",
                "AI & Data Science Intern",
                "AI & Data Science Intern",
                "Artificial Intelligence & Data",
                "/internship/student2.jpg",
                "มิ.ย. - ส.ค. 2025",
                "June - Aug 2025",
                "พัฒนาแบบจำลอง NLP ตรวจจับข้อความหลอกหลวงและฟิชชิงบนแอปพลิเคชันโมบายแบงก์กิ้ง",
                "Built NLP models to detect fraudulent messages and phishing attempts on mobile banking apps.",
                "สร้างและ Fine-tune โมเดล Thai-BERT ร่วมกับ PyTorch และ FastAPI เพื่อตรวจวิเคราะห์พฤติกรรมเสี่ยงและข้อความน่าสงสัย มีค่า Accuracy สูงถึง 94.8% พร้อมทำ A/B testing บนระบบจริง",
                "Fine-tuned Thai-BERT NLP models using PyTorch and FastAPI for risk pattern detection with 94.8% accuracy and deployed A/B testing on live telemetry.",
                json.dumps(["PyTorch", "Python", "BERT", "FastAPI", "Docker", "MLflow"], ensure_ascii=False),
                "ฝึกฝนการล้างข้อมูล (Data Cleaning) และการตีความผลของโมเดลให้เข้าใจชัดเจน จะทำให้เราทำงานกับทีมงานจริงได้อย่างมั่นใจ",
                "Practice data cleaning and model interpretability to collaborate effectively with production data teams.",
                "600 - 900 บาท / วัน (ประมาณ 18,000 - 22,000 บาท/เดือน)",
                "600 - 900 THB / day (approx. 18,000 - 22,000 THB/month)",
                json.dumps([
                    "โน้ตบุ๊กประสิทธิภาพสูงเฉพาะทางด้าน AI Workstation",
                    "ประกันอุบัติเหตุกลุ่มพนักงาน",
                    "รถตู้รับ-ส่งพนักงานฟรี (สถานี BTS อุดมสุข)",
                    "งบอบรมความรู้ทางเทคนิคจาก KBTG Academy"
                ], ensure_ascii=False),
                json.dumps([
                    "High-Performance AI Workstation Laptop",
                    "Group Accident Insurance Coverage",
                    "Free Shuttle Van Service (Udomsuk BTS)",
                    "Technical Training Budget by KBTG Academy"
                ], ensure_ascii=False),
                5.0
            ),
            (
                "intern-3",
                "นายธีรภัทร ชัยมงคล (CE#50)",
                "Theeraphat Chaimongkol (CE#50)",
                "LINE MAN Wongnai",
                "Backend & Cloud Engineer Intern",
                "Backend & Cloud Engineer Intern",
                "Cloud & Infrastructure",
                "/internship/student3.jpg",
                "มิ.ย. - ส.ค. 2025",
                "June - Aug 2025",
                "ออกแบบและสร้างระบบสตรีมมีข้อมูลคำสั่งซื้ออาหารด้วย Kafka และ Golang สำหรับระบบ Dispatching",
                "Architected real-time food delivery order streaming systems using Kafka and Golang for rider dispatching.",
                "ดูแลการออกแบบ Event-driven architecture ด้วย Apache Kafka และ Redis Cluster รองรับการประมวลผลคำสั่งซื้อช่วง Peak hours ของร้านอาหารกว่า 100,000 ร้านทั่วประเทศ",
                "Architected event-driven systems using Apache Kafka and Redis Cluster, handling peak hour order throughput across over 100,000 merchant stores nation-wide.",
                json.dumps(["Golang", "Kafka", "Redis", "Docker", "AWS EKS", "Prometheus"], ensure_ascii=False),
                "ควรศึกษาเรื่อง Concurrency, Threading และ Containerization ไว้ล่วงหน้า จะต่อยอดงานจริงได้ไวมาก",
                "Study concurrency, threading, and containerization fundamentals before starting your internship.",
                "700 - 1,000 บาท / วัน (ประมาณ 20,000 - 24,000 บาท/เดือน)",
                "700 - 1,000 THB / day (approx. 20,000 - 24,000 THB/month)",
                json.dumps([
                    "MacBook M3 Max สำหรับทีมวิศวกร",
                    "คูปองโค้ดส่วนลดสั่งอาหาร LINE MAN ฟรีประจำเดือน",
                    "Flexible Working Hours (เลือกเวลาทำงานยืดหยุ่น)",
                    "Snack Bar & ชากาแฟสดทานฟรีไม่จำกัด"
                ], ensure_ascii=False),
                json.dumps([
                    "MacBook M3 Max provided for engineering interns",
                    "Monthly LINE MAN Food Voucher Allowances",
                    "Flexible Working Hours",
                    "Unlimited Fresh Coffee & Snack Bar"
                ], ensure_ascii=False),
                5.0
            )
        ]

        for s in internship_students_data:
            cursor.execute(
                """INSERT INTO internship_students 
                (id, name_th, name_en, company, position_th, position_en, track, photo, period_th, period_en,
                 summary_th, summary_en, description_th, description_en, tech, advice_th, advice_en,
                 stipend_th, stipend_en, welfare_th, welfare_en, rating) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                s
            )

    print("seeded")


if __name__ == "__main__":
    main()
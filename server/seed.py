# Dev sample data. Run: python seed.py  (after `python db.py`)
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from db import db_cursor
from auth_utils import hash_password


def main() -> None:
    with db_cursor() as conn:
        # Wipe all existing table data & reset autoincrement sequences
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = OFF")
        tables = [
            "users", "teachers", "students", "works", "news_items",
            "class_schedules", "exam_schedules", "rooms",
            "internship_topics", "videos"
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
            ("อาจารย์อรรถศาสตร์ นาคเทวัญ", "Athasart Narkthewan", "athasart.webp", '["1"]', "athasart.n@ce.ac.th"),
            ("ดร.รัตติกร สมบัติแก้ว", "Rattikorn Sombutkaew", "rattikorn.webp", '["2"]', "rattikorn.s@ce.ac.th"),
            ("อาจารย์นภัสรพี สิทธิวัจน์", "Pisakorn Sittiwatjana", "pisakorn.webp", '["3"]', "pisakorn.s@ce.ac.th"),
            ("ว่าที่ร้อยตรี ศิลา ศิริมาสกุล", "Silar Sirimasakul", "silar.webp", '["4"]', "silar.s@ce.ac.th"),
            ("อาจารย์สกาวกาญจน์ ปิยะวิทย์วนิช", "Sakawkarn Piyawitwanich", "sakawkarn.webp", '["1", "2"]', "sakawkarn.p@ce.ac.th"),
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
                ("67200030", "นายคณพัฒน์ รุ่งรพีพรพงษ์", "Mr. Kanaphat Rungrapeepornpong", "/image/students/ce04/67200030.png", 3, "รองประธานสาขา", "224", "Tel: 00810247384 | IG: @pooh_2134"),
                ("67200093", "นายตระกูลชัย เเซ่ติ้ง", "Mr. trakoonchai saeting", "/image/students/ce04/67200093.png", 3, "", "006", "Tel: 0980850838 | IG: NULL"),
                ("67200324", "นายกนกพัฒน์ โพธิ", "Mr. Kanokphat Pothi", "/image/students/ce04/67200324.png", 3, "", "444", "Tel: 0926577824 | IG: @lxo_xelxeoo"),
                ("67200348", "นายณรงค์รักษ์ เรืองศักดิ์", "Mr. Narongrak Rueangsak", "/image/students/ce04/67200348.png", 3, "", "999", "Tel: 0929744516 | IG: @ainxri"),
                ("67200380", "นายปรินทร คงทอง", "Mr. Parinthon Kongthong", "/image/students/ce04/67200380.png", 3, "", "339", "Tel: 0631102883 | IG: @bank.parinthon"),
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

        # Seed class schedule (year=3, term=1) — real KMITL schedule
        SEED_YEAR, SEED_TERM = 3, 1
        kmitl_classes = [
            ("monday", "10:00 - 12:00", "11256011", "Software Development Processes (Lecture)", "SOFTWARE DEVELOPMENT PROCESSES (ทฤษฎี)", "E 107", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            ("monday", "13:00 - 16:00", "11256011-LAB", "Software Development Processes (Lab)", "SOFTWARE DEVELOPMENT PROCESSES (ปฏิบัติ)", "B 218 ป.คอมพิวเตอร์1", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            ("monday", "18:00 - 20:00", "90642172", "Team-Project 2 (Lab)", "TEAM-PROJECT 2 (ปฏิบัติ)", "E 111", "Pisakorn Sittiwatjana", "อ. นภัสรพี สิทธิวัจน์"),
            ("tuesday", "10:00 - 12:00", "11256016", "Database Systems (Lecture)", "DATABASE SYSTEMS (ทฤษฎี)", "B 218 ป.คอมพิวเตอร์1", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            ("tuesday", "13:00 - 16:00", "11256016-LAB", "Database Systems (Lab)", "DATABASE SYSTEMS (ปฏิบัติ)", "B 218 ป.คอมพิวเตอร์1", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            ("wednesday", "10:00 - 12:00", "11256027", "Computer Hardware Design (Lecture)", "COMPUTER HARDWARE DESIGN (ทฤษฎี)", "B 217", "Silar Sirimasakul", "อ. ศิลา ศิริมาสกุล"),
            ("wednesday", "13:00 - 16:00", "11256022-LAB", "Information and Computer Security (Lab)", "INFORMATION AND COMPUTER SECURITY (ปฏิบัติ)", "B 218 ป.คอมพิวเตอร์1", "Athasart Narkthewan", "อ. อรรถศาสตร์ นาคเทวัญ"),
            ("wednesday", "16:00 - 18:00", "11256022", "Information and Computer Security (Lecture)", "INFORMATION AND COMPUTER SECURITY (ทฤษฎี)", "B 218 ป.คอมพิวเตอร์1", "Athasart Narkthewan", "อ. อรรถศาสตร์ นาคเทวัญ"),
            ("thursday", "09:00 - 12:00", "11256027-LAB", "Computer Hardware Design (Lab)", "COMPUTER HARDWARE DESIGN (ปฏิบัติ)", "B 217", "Silar Sirimasakul", "อ. ศิลา ศิริมาสกุล"),
            ("thursday", "17:00 - 20:00", "11256025-LAB", "Computer Architecture (Lab)", "COMPUTER ARCHITECTURE (ปฏิบัติ)", "E 107", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
            ("friday", "10:00 - 12:00", "11256025", "Computer Architecture (Lecture)", "COMPUTER ARCHITECTURE (ทฤษฎี)", "E 111", "Dr. Rattikorn Sombutkaew", "ดร. รัตติกร สมบัติแก้ว"),
        ]

        cursor = conn.cursor()
        cursor.execute("DELETE FROM class_schedules WHERE year=? AND term=?", (SEED_YEAR, SEED_TERM))
        for day, time_slot, code, name_en, name_th, room, instr_en, instr_th in kmitl_classes:
            cursor.execute(
                "INSERT INTO class_schedules (year, term, day, time_slot, code, name_en, name_th, room, instructor_en, instructor_th) "
                "VALUES (?,?,?,?,?,?,?,?,?,?)",
                (SEED_YEAR, SEED_TERM, day, time_slot, code, name_en, name_th, room, instr_en, instr_th),
            )

        # Seed exam schedule (year=3, term=1)
        exams_data = [
            ("11256011", "Software Development Processes", "SOFTWARE DEVELOPMENT PROCESSES", "2026-08-23", "13:30", "16:30",
             "Sun 23 Aug 2026 (13:30 - 16:30)", "อาทิตย์ 23 ส.ค. 2569 (13:30 - 16:30)",
             "Tue 3 Nov 2026 (13:30 - 16:30)", "อังคาร 3 พ.ย. 2569 (13:30 - 16:30)"),
            ("11256016", "Database Systems", "DATABASE SYSTEMS", "2026-08-21", "13:30", "16:30",
             "Fri 21 Aug 2026 (13:30 - 16:30)", "ศุกร์ 21 ส.ค. 2569 (13:30 - 16:30)",
             "Fri 30 Oct 2026 (13:30 - 16:30)", "ศุกร์ 30 ต.ค. 2569 (13:30 - 16:30)"),
            ("11256022", "Information and Computer Security", "INFORMATION AND COMPUTER SECURITY", "2026-10-26", "13:30", "16:30",
             "Arranged by Lecturer", "จัดสอบเอง",
             "Mon 26 Oct 2026 (13:30 - 16:30)", "จันทร์ 26 ต.ค. 2569 (13:30 - 16:30)"),
            ("11256025", "Computer Architecture", "COMPUTER ARCHITECTURE", "2026-08-19", "13:30", "16:30",
             "Wed 19 Aug 2026 (13:30 - 16:30)", "พุธ 19 ส.ค. 2569 (13:30 - 16:30)",
             "Wed 28 Oct 2026 (13:30 - 16:30)", "พุธ 28 ต.ค. 2569 (13:30 - 16:30)"),
            ("11256027", "Computer Hardware Design", "COMPUTER HARDWARE DESIGN", "2026-11-04", "13:30", "16:30",
             "Arranged by Lecturer", "จัดสอบเอง",
             "Wed 4 Nov 2026 (13:30 - 16:30)", "พุธ 4 พ.ย. 2569 (13:30 - 16:30)"),
            ("90642172", "Team-Project 2", "TEAM-PROJECT 2", "9999-12-31", "-", "-",
             "Arranged by Lecturer", "จัดสอบเอง",
             "Arranged by Lecturer", "จัดสอบเอง"),
        ]
        cursor = conn.cursor()
        cursor.execute("DELETE FROM exam_schedules WHERE year=? AND term=?", (SEED_YEAR, SEED_TERM))
        for code, name_en, name_th, date_raw, start_time, end_time, mid_en, mid_th, fin_en, fin_th in exams_data:
            cursor.execute(
                "INSERT INTO exam_schedules "
                "(year, term, code, name_en, name_th, date_raw, start_time, end_time, midterm_en, midterm_th, finals_en, finals_th) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                (SEED_YEAR, SEED_TERM, code, name_en, name_th, date_raw, start_time, end_time, mid_en, mid_th, fin_en, fin_th),
            )

    print("seeded")


if __name__ == "__main__":
    main()
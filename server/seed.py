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

        # Seed class schedule (year=3, term=1) — flat cells, mirrors DEFAULT_CLASSES in schedule-client.tsx
        SEED_YEAR, SEED_TERM = 3, 1
        courses = {
            "CPE 321": ("Database Systems", "ระบบฐานข้อมูล", "CPE-401", "Dr. Sarah Johnson", "ดร. ซาร่าห์ จอห์นสัน",
                "Introduction to database management systems. Topics include relational database design, query languages (SQL), database storage and indexing, transaction management, concurrency control, and database administration.",
                "สถาปัตยกรรมระบบจัดการฐานข้อมูล แบบจำลองข้อมูลความสัมพันธ์ ภาษาคิวรีมาตรฐาน (SQL) การออกแบบฐานข้อมูลเชิงสัมพันธ์ด้วยขั้นตอนวิธีนอร์มัลไลเซชัน การควบคุมภาวะพร้อมกัน การกู้คืนระบบ และการจัดการความปลอดภัย"),
            "CPE 322": ("Software Engineering", "วิศวกรรมซอฟต์แวร์", "CPE-402", "Dr. Michael Chen", "ดร. ไมเคิล เฉิน",
                "Principles of software engineering. Topics include software development lifecycles, requirement analysis, software design patterns, architectural styles, software testing, agile methodologies, and project management.",
                "หลักการวิศวกรรมซอฟต์แวร์ วงจรการพัฒนาซอฟต์แวร์ การวิเคราะห์ความต้องการ การออกแบบระบบสถาปัตยกรรมซอฟต์แวร์ รูปแบบการทดสอบซอฟต์แวร์ กระบวนการพัฒนาแบบเอจายล์ และการจัดการโครงการซอฟต์แวร์"),
            "CPE 323": ("Computer Networks", "เครือข่ายคอมพิวเตอร์", "CPE-501", "Dr. Alan Turing", "ดร. อลัน ทัวริง",
                "Fundamentals of computer networks and communications. Topics include OSI model, TCP/IP protocol suite, network routing algorithms, transport layer congestion control, DNS, HTTP, and network security concepts.",
                "สถาปัตยกรรมโครงข่ายเครือข่ายคอมพิวเตอร์ตามแบบจำลอง OSI และ TCP/IP อัลกอริทึมการกำหนดเส้นทาง การควบคุมความคับคั่งในระดับชั้นขนส่ง โปรโตคอลแอปพลิเคชัน และความปลอดภัยบนระบบเครือข่าย"),
            "CPE 324": ("Embedded Systems", "ระบบฝังตัว", "CPE-502", "Dr. Grace Hopper", "ดร. เกรซ ฮอปเปอร์",
                "Introduction to embedded systems design. Topics include microcontroller architecture, hardware-software co-design, real-time operating systems (RTOS), serial communication interfaces (I2C, SPI, UART), and sensor interfacing.",
                "การออกแบบระบบคอมพิวเตอร์ฝังตัว สถาปัตยกรรมไมโครคอนโทรลเลอร์ การควบคุมอุปกรณ์รับเข้าและส่งออก อินเทอร์เฟสระบบสื่อสารอนุกรม ระบบปฏิบัติการเวลาจริง (RTOS) และการเชื่อมต่อเซนเซอร์"),
            "CPE 325": ("Artificial Intelligence", "ปัญญาประดิษฐ์", "CPE-601", "Dr. John McCarthy", "ดร. จอห์น แมคคาร์ธี",
                "Principles of artificial intelligence. Topics include heuristic search techniques, knowledge representation, logic programming, machine learning algorithms, artificial neural networks, and decision theory.",
                "แนวคิดพื้นฐานเกี่ยวกับปัญญาประดิษฐ์ เทคนิคการค้นหาเชิงศึกษาพยากรณ์ การแสดงความรู้ การให้เหตุผลเชิงตรรกะ ตัวแทนที่ชาญฉลาด และการประยุกต์ใช้งานขั้นตอนวิธีเรียนรู้ของเครื่อง"),
            "CPE 326": ("Operating Systems", "ระบบปฏิบัติการ", "CPE-401", "Dr. Sarah Johnson", "ดร. ซาร่าห์ จอห์นสัน",
                "Principles of operating systems architecture. Topics include process synchronization, CPU scheduling, thread management, memory management, virtual memory techniques, file systems, disk scheduling, and deadlocks.",
                "โครงสร้างและหน้าที่ของระบบปฏิบัติการ การจัดการกระบวนการ การจัดตารางเวลาของซีพียู การจัดการหน่วยความจำหลัก หน่วยความจำเสมือน ระบบแฟ้มข้อมูล และการจัดการทรัพยากรเมื่อเกิดการติดตาย"),
            "CPE 381": ("Comp Eng Lab III", "ปฏิบัติการวิศวกรรมคอมพิวเตอร์ 3", "CPE-Lab 3", "Dr. Linus Torvalds", "ดร. ไลนัส ทอร์วัลด์ส",
                "Practical experiments in computer engineering. Focuses on advanced web services development, network socket programming, API integration, and hands-on system administration in Linux servers.",
                "การทดลองเชิงปฏิบัติการวิศวกรรมคอมพิวเตอร์ มุ่งเน้นการสร้างเว็บเซอร์วิสขั้นสูง โปรแกรมมิ่งซ็อกเก็ตเครือข่าย การผสานอินเทอร์เฟส API และทักษะการดูแลระบบเซิร์ฟเวอร์ด้วย Linux"),
        }

        # (time_slot, [(day, code), ...]) — null days omitted
        class_grid = [
            ("09:00 - 10:00", ["monday", "tuesday", "wednesday", "thursday", "friday"]),
            ("10:00 - 11:00", ["monday", "tuesday", "wednesday", "thursday", "friday"]),
            ("11:00 - 12:00", ["monday", "tuesday", "wednesday", "thursday", "friday"]),
            ("13:00 - 14:00", ["monday", "wednesday"]),
            ("14:00 - 15:00", ["monday", "wednesday"]),
            ("15:00 - 16:00", ["monday", "wednesday"]),
        ]
        # Course per day for first 3 rows (09:00–12:00): ordered by day index
        first_block_codes = ["CPE 321", "CPE 322", "CPE 323", "CPE 324", "CPE 325"]
        # Course per day for afternoon rows: monday=CPE 326, wednesday=CPE 381
        afternoon_codes = {"monday": "CPE 326", "wednesday": "CPE 381"}

        class_cells = []
        for time_slot, days in class_grid:
            for day in days:
                if time_slot.startswith("09:") or time_slot.startswith("10:") or time_slot.startswith("11:"):
                    code = first_block_codes[["monday","tuesday","wednesday","thursday","friday"].index(day)]
                else:
                    code = afternoon_codes[day]
                class_cells.append((day, time_slot, code))

        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM class_schedules WHERE year=? AND term=?",
            (SEED_YEAR, SEED_TERM),
        )
        for day, time_slot, code in class_cells:
            name_en, name_th, room, instr_en, instr_th, desc_en, desc_th = courses[code]
            cursor.execute(
                "INSERT INTO class_schedules "
                "(year, term, day, time_slot, code, name_en, name_th, room, instructor_en, instructor_th, description_en, description_th) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                (SEED_YEAR, SEED_TERM, day, time_slot, code, name_en, name_th, room, instr_en, instr_th, desc_en, desc_th),
            )

        # Seed exam schedule (year=3, term=1) — mirrors DEFAULT_EXAMS in schedule-client.tsx
        exams_data = [
            ("CPE 321", "Database Systems", "ระบบฐานข้อมูล", "2026-10-12", "09:00", "12:00",
             "Oct 12, 2026 (09:00 - 12:00)", "12 ต.ค. 2569 (09:00 - 12:00)",
             "Dec 14, 2026 (09:00 - 12:00)", "14 ธ.ค. 2569 (09:00 - 12:00)"),
            ("CPE 322", "Software Engineering", "วิศวกรรมซอฟต์แวร์", "2026-10-13", "13:00", "16:00",
             "Oct 13, 2026 (13:00 - 16:00)", "13 ต.ค. 2569 (13:00 - 16:00)",
             "Dec 15, 2026 (13:00 - 16:00)", "15 ธ.ค. 2569 (13:00 - 16:00)"),
            ("CPE 323", "Computer Networks", "เครือข่ายคอมพิวเตอร์", "2026-10-14", "09:00", "12:00",
             "Oct 14, 2026 (09:00 - 12:00)", "14 ต.ค. 2569 (09:00 - 12:00)",
             "Dec 16, 2026 (09:00 - 12:00)", "16 ธ.ค. 2569 (09:00 - 12:00)"),
            ("CPE 324", "Embedded Systems", "ระบบฝังตัว", "2026-10-15", "13:00", "16:00",
             "Oct 15, 2026 (13:00 - 16:00)", "15 ต.ค. 2569 (13:00 - 16:00)",
             "Dec 17, 2026 (13:00 - 16:00)", "17 ธ.ค. 2569 (13:00 - 16:00)"),
            ("CPE 325", "Artificial Intelligence", "ปัญญาประดิษฐ์", "2026-10-16", "09:00", "12:00",
             "Oct 16, 2026 (09:00 - 12:00)", "16 ต.ค. 2569 (09:00 - 12:00)",
             "Dec 18, 2026 (09:00 - 12:00)", "18 ธ.ค. 2569 (09:00 - 12:00)"),
            ("CPE 326", "Operating Systems", "ระบบปฏิบัติการ", "2026-10-19", "13:00", "16:00",
             "Oct 19, 2026 (13:00 - 16:00)", "19 ต.ค. 2569 (13:00 - 16:00)",
             "Dec 21, 2026 (13:00 - 16:00)", "21 ธ.ค. 2569 (13:00 - 16:00)"),
        ]
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM exam_schedules WHERE year=? AND term=?",
            (SEED_YEAR, SEED_TERM),
        )
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
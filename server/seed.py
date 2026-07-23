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
                ("67200412", "นายรุจิณัฐ อาศิรเมธี", "Mr. Rujinat Asirametee", None, 3, "", "006", "Tel: 0800479886 | IG: @Rujinat_Fah"),
                ("67200014", "นางสาวกัณฐมณี กอบการ", "Miss Kantamanee Kobkarn", None, 3, "เลขา", "339", "Tel: 0875732080 | IG: @kwin_mhy"),
                ("67200099", "นายทัชภูมิ ใจดี", "Mr. Thatchaphum Jaidee", None, 3, "", "787", "Tel: 0986782950 | IG: @pipe2bot"),
                ("67200049", "นายเจษฎา ศรีสง่า", "Mr. Jetsada Srisanga", None, 3, "ประธานชั้นปีที่3", "538", "Tel: 0626253837 | IG: @p_Jetsada_p"),
                ("67200102", "นายทีปกิติ์ พรหมสัตยพรต", "Mr. Teepakit Phormmasattayaprot", None, 3, "", "444", "Tel: 0973016465 | IG: @lil_weirx"),
                ("67200350", "นางสาวณัฏฐ์ชยา จำปา", "Miss Natchaya Champa", None, 3, "เหรัญญิก", "123", "Tel: 0985364534 | IG: @Waa_.zz"),
                ("67200235", "นางสาวรินรดา บุญมี", "Miss Rinrada Boonmee", None, 3, "", "800", "Tel: 0937764085 | IG: @nnoey.rb"),
                ("67200079", "นางสาวณัฐธิดา เกื้อประจง", "Miss Natthida Kueaprajong", None, 3, "เหรัญญิก", "007", "Tel: 0801585306 | IG: @ntd.axn"),
                ("67200223", "นายมีสุข เอกพงษ์", "Mr. Misuk Aekkaphong", None, 3, "", "800", "Tel: 0831508487 | IG: @Messily ekkaphong"),
                ("67200369", "นายธีรศาสนต์ คงเกิด", "Mr. Thirasan Khongkoed", None, 3, "", "800", "Tel: 0656709042 | IG: @Teeuytee"),
                ("67200030", "นายคณพัฒน์ รุ่งรพีพรพงษ์", "Mr. Kanaphat Rungrapeepornpong", None, 3, "รองประธานสาขา", "224", "Tel: 0810247384 | IG: @pooh_2134"),
                ("67200093", "นายตระกูลชัย เเซ่ติ้ง", "Mr. trakoonchai saeting", None, 3, "", "006", "Tel: 0980850838 | IG: NULL"),
                ("67200324", "นายกนกพัฒน์ โพธิ", "Mr. Kanokphat Pothi", None, 3, "", "444", "Tel: 0926577824 | IG: @lxo_xelxeoo"),
                ("67200348", "นายณรงค์รักษ์ เรืองศักดิ์", "Mr. Narongrak Rueangsak", None, 3, "", "999", "Tel: 0929744516 | IG: @ainxri"),
                ("67200380", "นายปรินทร คงทอง", "Mr. Parinthon Kongthong", None, 3, "", "339", "Tel: 0631102883 | IG: @bank.parinthon"),
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
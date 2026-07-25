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
            "internship_students"
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

        # Seed teachers
        teachers_data = [
            ("อาจารย์อรรถศาสตร์ นาคเทวัญ", "Athasart Narkthewan", "athasart.webp", '["1"]', "athasart.na@kmitl.ac.th", "อาจารย์ประจำสาขา", "Faculty Member"),
            ("ดร.รัตติกร สมบัติแก้ว", "Rattikorn Sombutkaew", "rattikorn.webp", '["2"]', "rattikorn.so@kmitl.ac.th", "อาจารย์ประจำสาขา", "Faculty Member"),
            ("อาจารย์นภัสรพี สิทธิวัจน์", "Pisakorn Sittiwatjana", "pisakorn.webp", '["3"]', "pisakorn.si@kmitl.ac.th", "อาจารย์ประจำสาขา", "Faculty Member"),
            ("ว่าที่ร้อยตรี ศิลา ศิริมาสกุล", "Silar Sirimasakul", "silar.webp", '["4"]', "silar.si@kmitl.ac.th", "อาจารย์ประจำสาขา", "Faculty Member"),
            ("อาจารย์สกาวกาญจน์ ปิยะวิทย์วนิช", "Sakawkarn Piyawitwanich", "sakawkarn.webp", '["1", "2"]', "sakawkarn.pi@kmitl.ac.th", "อาจารย์ประจำสาขา", "Faculty Member"),
            ("นายจตุรงค์ เกตุนิมิต", "Jaturong Katenimit", "jaturong.webp", '[]', "jaturong.k@ce.ac.th", "นักวิชาการคอมพิวเตอร์", "Computer Technical Officer")
        ]

        for name_th, name_en, photo_filename, advise_years, contact, role_th, role_en in teachers_data:
            photo_path = f"/image/professors/{photo_filename}"
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM teachers WHERE name_th = ?", (name_th,))
            row = cursor.fetchone()
            if row:
                cursor.execute(
                    "UPDATE teachers SET name_en = ?, photo = ?, advise_years = ?, contact = ?, role_th = ?, role_en = ? WHERE id = ?",
                    (name_en, photo_path, advise_years, contact, role_th, role_en, row[0])
                )
            else:
                cursor.execute(
                    "INSERT INTO teachers (name_th, name_en, photo, advise_years, contact, role_th, role_en) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (name_th, name_en, photo_path, advise_years, contact, role_th, role_en)
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

        # Seed works
        works_data = [
            (
                3,
                "group",
                "ระบบ POS สำหรับร้านขายของชำ แบบครบวงจร",
                "เครื่อง point-of-sale ต้นทุนเหมาะสม ช่วยคิดเงิน บันทึกยอดขาย และจัดการ\nสินค้าลงคลังได้อย่างแม่นยำ และรวดเร็ว\n\nสไลด์นำเสนอ: file:///C:/Users/Asus/Downloads/pos_presentation_final.pdf",
                None,
                json.dumps(["67200380", "67200324", "67200258", "67200030"], ensure_ascii=False)
            ),
            (
                3,
                "group",
                "Security Door Lock  ระบบควบคุมการเข้า  -ออก",
                "พัฒนาระบบควบคุมการเข้า-ออกประตูด้วยบัตร RFID ร่วมกับกล้องตรวจจับและระบบแจ้งเตือนแบบเรียลไทม์ จะสามารถเพิ่มความปลอดภัยในการเข้า-ออกสถานที่ ลดปัญหาการเข้าใช้งานโดยไม่ได้รับอนุญาต และมีหลักฐานภาพประกอบการตรวจสอบย้อนหลังได้ดีกว่าระบบกุญแจแบบเดิม\n\nสไลด์นำเสนอ: file:///C:/Users/Asus/Downloads/Security_Door_Lock.pdf",
                None,
                json.dumps(["67200030", "67200305", "67200368", "67200369"], ensure_ascii=False)
            ),
            (
                3,
                "group",
                "H.I.V.E. ( Hardware Integrated Vulnerable Environment )",
                "พื่อออกแบบและพัฒนาระบบ Honeypot \nที่สามารถจำลองและดักจับการโจมตีทางไซเบอร์ผ่านช่องโหว่ระดับวิกฤตในโลกจริงได้ และ เพื่อพัฒนาระบบศูนย์ปฏิบัติการ \n(SOC Dashboard) บน Cloud ที่สามารถแสดงผลและแจ้งเตือนสถานะความปลอดภัยได้แบบ Real Time\n\nสไลด์นำเสนอ: https://www.canva.com/design/DAHOlyFhW8I/L9Z5JAUNvcGckgCQILpidA/edit",
                None,
                json.dumps(["67200032", "67200099", "67200102", "67200412"], ensure_ascii=False)
            )
        ]
        cursor = conn.cursor()
        cursor.execute("DELETE FROM works")
        for yr, scope, title, desc, img, authors in works_data:
            cursor.execute(
                "INSERT INTO works (year, scope, title, description, image, author_ids) VALUES (?, ?, ?, ?, ?, ?)",
                (yr, scope, title, desc, img, authors)
            )

        # Seed initial news items
        news_data = [
            (
                "Cabling Contest ปีที่ 14",
                "competition",
                "อินเตอร์ลิ้งค์ฯ แถลงข่าวเปิดศึกการแข่งขัน “Cabling Contest ปีที่ 14” เวทีชิงแชมป์ถ้วยพระราชทานฯ เฟ้นหาทีมทักษะสายสัญญาณชั้นเลิศ “The Masterpiece Behind The Network” ก้าวเป็นมืออาชีพของวงการโครงสร้างพื้นฐานดิจิทัล",
                "https://interlink.co.th/news/detail/KdUtKTGb7C",
                "/image/news/Cabling-Contest.jpg",
                "7/18/2026 22:26:21"
            ),
            (
                "TGR2026 News Update: 27/5/69",
                "competition",
                "คณะทำงานของทุกฝ่าย เข้าร่วมประชุม TGR2026 Meeting 3/2569 ระหว่างวันที่ 25-27 พฤษภาคม 2569 ที่ผ่านมา ณ สถาบันเทคโนโลยีพระจอมเกล้าฯ ลาดกระบัง วิทยาเขตชุมพร  เพื่อกำหนดโจทย์การประชันทักษะทางด้าน Embedded System  และเตรียมความพร้อมเรื่องสถานที่การจัดกิจกรรมดังกล่าว ที่จะมีขึ้นในระหว่างวันที่ 15-21 พฤศจิกายน ศกนี้\nขอขอบคุณทีมงาน สจล.วิทยาเขตชุมพรทุกท่าน ที่ช่วยเตรียมการประสานงาน และทำให้การประชุมบรรลุตามเป้าประสงค์อย่างรวดเร็วอีกด้วย ขอชื่นชม ทีมงานทำงานแบบมืออาชีพมากๆ ด้วยค่ะ",
                "https://web.facebook.com/TESA.TGR/?_rdc=1&_rdr#",
                "/image/news/TopGun-Rally.jpg",
                "7/18/2026 22:36:39"
            )
        ]
        cursor.execute("DELETE FROM news_items")
        for title, category, body, link, image, pub_at in news_data:
            cursor.execute(
                "INSERT INTO news_items (title, category, body, link, image, published_at) VALUES (?, ?, ?, ?, ?, ?)",
                (title, category, body, link, image, pub_at)
            )

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
        # tuple format: (year, term, code, name_th, name_en, m_type, m_date, m_start, m_end, m_room, f_type, f_date, f_start, f_end, f_room)
        exams_all = [
            # Year 1
            (1, 1, "01006001", "แคลคูลัส 1", "Calculus 1", "scheduled", "2026-08-20", "09:00", "12:00", "E113", "scheduled", "2026-10-29", "09:00", "12:00", "E113"),
            (1, 1, "01006002", "การโปรแกรมคอมพิวเตอร์", "Computer Programming", "scheduled", "2026-08-22", "09:00", "12:00", "E113", "scheduled", "2026-10-31", "09:00", "12:00", "E113"),

            # Year 2
            (2, 1, "02006010", "โครงสร้างข้อมูลและอัลกอริทึม", "Data Structures & Algorithms", "scheduled", "2026-08-20", "13:30", "16:30", "E113", "scheduled", "2026-10-29", "13:30", "16:30", "E113"),

            # Year 3
            (3, 1, "11256011", "SOFTWARE DEVELOPMENT PROCESSES", "Software Development Processes", "scheduled", "2026-08-23", "13:30", "16:30", "E113", "scheduled", "2026-11-03", "13:30", "16:30", "E113"),
            (3, 1, "11256016", "DATABASE SYSTEMS", "Database Systems", "scheduled", "2026-08-21", "13:30", "16:30", "E113", "scheduled", "2026-10-30", "13:30", "16:30", "E113"),
            (3, 1, "11256022", "INFORMATION AND COMPUTER SECURITY", "Information and Computer Security", "arranged", None, None, None, None, "scheduled", "2026-10-26", "13:30", "16:30", "E113"),
            (3, 1, "11256025", "COMPUTER ARCHITECTURE", "Computer Architecture", "scheduled", "2026-08-19", "13:30", "16:30", "E113", "scheduled", "2026-10-28", "13:30", "16:30", "E113"),
            (3, 1, "11256027", "COMPUTER HARDWARE DESIGN", "Computer Hardware Design", "arranged", None, None, None, None, "scheduled", "2026-11-04", "13:30", "16:30", "E113"),
            (3, 1, "90642172", "TEAM-PROJECT 2", "Team-Project 2", "arranged", None, None, None, None, "arranged", None, None, None, None),

            # Year 4
            (4, 1, "04006020", "โครงงานวิศวกรรมคอมพิวเตอร์ 1", "Senior Project I", "arranged", None, None, None, None, "arranged", None, None, None, None),
        ]
        cursor = conn.cursor()
        cursor.execute("DELETE FROM exam_schedules")
        for yr, trm, code, name_th, name_en, m_type, m_date, m_start, m_end, m_room, f_type, f_date, f_start, f_end, f_room in exams_all:
            cursor.execute(
                "INSERT INTO exam_schedules "
                "(year, term, code, name_th, name_en, midterm_type, midterm_date, midterm_start_time, midterm_end_time, midterm_room, "
                " finals_type, finals_date, finals_start_time, finals_end_time, finals_room) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (yr, trm, code, name_th, name_en, m_type, m_date, m_start, m_end, m_room, f_type, f_date, f_start, f_end, f_room),
            )

        # Seed student internship records
        internship_students_data = [
            (
                "intern-3",
                "67200380",
                "LINE MAN Wongnai",
                "Backend & Cloud Engineer Intern",
                "Backend & Cloud Engineer Intern",
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
                (id, student_id, company, position_th, position_en, period_th, period_en,
                 summary_th, summary_en, description_th, description_en, tech, advice_th, advice_en,
                 stipend_th, stipend_en, welfare_th, welfare_en, rating) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                s
            )

    print("seeded")


if __name__ == "__main__":
    main()
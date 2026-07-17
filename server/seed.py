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
            ("อาจารย์อรรถศาสตร์ นาคเทวัญ", "Athasart Narkthewan", "athasart.png", '["1"]'),
            ("ดร.รัตติกร สมบัติแก้ว", "Rattikorn Sombutkaew", "rattikorn.png", '["2"]'),
            ("อาจารย์นภัสรพี สิทธิวัจน์", "Pisakorn Sittiwatjana", "pisakorn.png", '["3"]'),
            ("ว่าที่ร้อยตรี ศิลา ศิริมาสกุล", "Silar Sirimasakul", "silar.png", '["4"]'),
            ("อาจารย์สกาวกาญจน์ ปิยะวิทย์วนิช", "Sakawkarn Piyawitwanich", "sakawkarn.png", '["1", "2"]'),
            ("นายจตุรงค์ เกตุนิมิต", "Jaturong Katenimit", "jaturong.png", '[]')
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
                
    print("seeded")


if __name__ == "__main__":
    main()
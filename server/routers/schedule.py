from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
import json
from db import get_db

router = APIRouter(prefix="/schedule", tags=["schedule"])


class ScheduleUpdate(BaseModel):
    kind: str
    year: int
    term: int | None = 1
    payload: str  # JSON string containing class/exam schedule list


@router.get("/")
def list_schedule(
    kind: str | None = Query(None, description="class or exam"),
    year: int | None = Query(None, description="academic year")
):
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM schedules WHERE 1=1"
    params = []
    if kind is not None:
        query += " AND kind = ?"
        params.append(kind)
    if year is not None:
        query += " AND year = ?"
        params.append(year)
        
    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        row_dict = dict(row)
        try:
            row_dict["payload"] = json.loads(row_dict["payload"])
        except Exception:
            row_dict["payload"] = []
        results.append(row_dict)
        
    return results


@router.post("/")
def update_schedule(data: ScheduleUpdate):
    if data.kind not in ("class", "exam"):
        raise HTTPException(status_code=400, detail="Invalid schedule kind")
        
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if record already exists for this kind and year
    cursor.execute(
        "SELECT id FROM schedules WHERE kind = ? AND year = ?",
        (data.kind, data.year)
    )
    row = cursor.fetchone()
    
    if row:
        cursor.execute(
            "UPDATE schedules SET payload = ?, term = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (data.payload, data.term, row[0])
        )
    else:
        cursor.execute(
            "INSERT INTO schedules (kind, year, term, payload) VALUES (?, ?, ?, ?)",
            (data.kind, data.year, data.term, data.payload)
        )
    conn.commit()
    conn.close()
    return {"status": "success"}

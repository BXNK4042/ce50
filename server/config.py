import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

# Load .env.local (preferred) then .env from repo root.
load_dotenv(BASE_DIR.parent / ".env.local")
load_dotenv(BASE_DIR.parent / ".env")

DB_PATH = Path(os.getenv("DB_PATH", BASE_DIR / "ce50.db"))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", BASE_DIR / "image"))
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]

# JWT Configuration for Authentication.
# ponytail: fail loud rather than ship a known default secret — fresh checkout
# must set JWT_SECRET in .env.local before the server will start.
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET or JWT_SECRET == "super-secret-key-change-me":
    raise RuntimeError(
        "JWT_SECRET is not set. Add JWT_SECRET=<random> to .env.local before starting."
    )
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# GNews Integration Configuration
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY", "")
GNEWS_QUERY = os.getenv("GNEWS_QUERY", "AI Chip OR Semiconductor")
GNEWS_SYNC_INTERVAL_HOURS = int(os.getenv("GNEWS_SYNC_INTERVAL_HOURS", "12"))

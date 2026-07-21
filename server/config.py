import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Custom helper to load .env / .env.local without external package python-dotenv
def load_dotenv_custom():
    for name in (".env.local", ".env"):
        path = BASE_DIR.parent / name
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip("'\"")
                        if key not in os.environ:
                            os.environ[key] = val

load_dotenv_custom()

DB_PATH = Path(os.getenv("DB_PATH", BASE_DIR / "ce50.db"))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", BASE_DIR / "image"))
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "change-me")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# JWT Configurations for Authentication
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-me")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# GNews Integration Configurations
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY", "")
GNEWS_QUERY = os.getenv("GNEWS_QUERY", "AI Chip OR Semiconductor")
GNEWS_SYNC_INTERVAL_HOURS = int(os.getenv("GNEWS_SYNC_INTERVAL_HOURS", "12"))


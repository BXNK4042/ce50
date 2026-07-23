from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, UPLOAD_DIR
from db import init_db
from routers import auth, news, people, schedule, videos, works, rooms, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="CE50 API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent

# Create the upload directory eagerly. The /image StaticFiles mount below
# requires the directory to exist at import time, but init_db() (which also
# mkdirs) only runs in the FastAPI lifespan — after this module body.
# Without this, fresh checkouts crash before the server can boot.
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/image", StaticFiles(directory=UPLOAD_DIR), name="image")
app.mount("/Video", StaticFiles(directory=BASE_DIR / "video"), name="video")

for r in (people, news, schedule, auth, videos, works, rooms, users):
    app.include_router(r.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

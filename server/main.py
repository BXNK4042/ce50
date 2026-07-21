from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, UPLOAD_DIR
from db import init_db
from routers import auth, news, people, schedule, videos


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

app.mount("/image", StaticFiles(directory=UPLOAD_DIR), name="image")
app.mount("/Video", StaticFiles(directory=BASE_DIR / "video"), name="video")

for r in (people, news, schedule, auth, videos):
    app.include_router(r.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

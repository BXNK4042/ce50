from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, UPLOAD_DIR
from db import init_db
from routers import auth, internship, news, people, rooms, schedule, works

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="CE50 API", version="0.1.0")
app.mount("/image", StaticFiles(directory="image"), name="image")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/image", StaticFiles(directory=UPLOAD_DIR), name="image")

for r in (people, works, news, schedule, auth, rooms, internship):
    app.include_router(r.router)


@app.on_event("startup")
def _startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

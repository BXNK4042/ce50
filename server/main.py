from contextlib import asynccontextmanager
from pathlib import Path

import time
from collections import defaultdict
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, UPLOAD_DIR
from db import init_db
from routers import auth, internship, news, people, rooms, schedule, users, works

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="CE50 API", version="0.1.0", lifespan=lifespan)

# ponytail: simple memory sliding window rate limiter for auth endpoints
RATE_LIMIT_STORE = defaultdict(list)
MAX_AUTH_REQUESTS = 10
WINDOW_SECONDS = 60

@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # 1. Rate limiting on POST /admin/login and /admin/register
    if request.method == "POST" and request.url.path in ["/admin/login", "/admin/register"]:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        timestamps = [t for t in RATE_LIMIT_STORE[client_ip] if now - t < WINDOW_SECONDS]
        if len(timestamps) >= MAX_AUTH_REQUESTS:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please try again later."}
            )
        timestamps.append(now)
        RATE_LIMIT_STORE[client_ip] = timestamps

    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

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

for r in (people, news, schedule, auth, works, rooms, users, internship):
    app.include_router(r.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

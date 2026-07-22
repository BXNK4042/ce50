# run-dev.sh Error Report

Date: 2026-07-22
Scope: Errors observed when launching the CE50 dev environment via `run-dev.sh`.

## Summary

| Component | Status | Verdict |
|-----------|--------|---------|
| Frontend (Next.js 16.2.10, Turbopack) | Boots clean | OK — `Ready in 223ms` |
| Backend (FastAPI / Uvicorn) | Crashes at import | **BLOCKER** |
| `run-dev.sh` orchestration (tmux) | OK | tmux splits + attaches correctly |

Only one hard error. The frontend is healthy; the backend never reaches the
request loop, so the frontend cannot reach the API (cascade, not a separate
bug).

## Reproduction

```bash
.venv/bin/python -m uvicorn main:app --app-dir server --host 127.0.0.1 --port 8001
```

Frontend (control):

```bash
npm run dev   # → Ready in 223ms, http://localhost:3000
```

## Backend Error (the only real defect)

```
File "/home/bankrupt/ce50/server/main.py", line 31, in <module>
    app.mount("/image", StaticFiles(directory=UPLOAD_DIR), name="image")
                        ~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^
File ".../starlette/staticfiles.py", line 56, in __init__
    raise RuntimeError(f"Directory '{directory}' does not exist")
RuntimeError: Directory '/home/bankrupt/ce50/server/image' does not exist
```

- File: `server/main.py:31`
- Layer: FastAPI app construction (module import time, before lifespan)
- Trigger: `UPLOAD_DIR` (= `server/image`) is missing on disk

## Frontend Log (control — no errors)

```
▲ Next.js 16.2.10 (Turbopack)
- Local:        http://localhost:3000
- Environments: .env
✓ Ready in 223ms
```

Next.js starts cleanly. Any "frontend errors" seen in the browser are the
downstream symptom of the backend being unreachable (fetch to `/people/*`,
`/news`, etc. return network errors), not frontend defects.

## Environment Notes

- Python 3.14.3, uvicorn 0.51.0 (venv at `.venv/`)
- `.env` present with `JWT_SECRET` set → passes the config gate in `config.py:24`
- `.env.local` absent (config falls back to `.env`; non-blocking)
- `server/video/` exists with footage → second `StaticFiles` mount is fine
- `server/image/` absent → first `StaticFiles` mount crashes

## Components Verified Working

- `run-dev.sh`: venv detection, tmux session/split, attach — all OK
- Frontend boot, Turbopack compile, `.env` load — OK
- `config.py` env loading + JWT_SECRET gate — OK
- `server/video/` static mount — OK

## Severity

**P0 — blocks all backend development.** No endpoint can be reached until
the `StaticFiles` import-time crash is resolved.

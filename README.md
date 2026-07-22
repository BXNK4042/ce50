# CE50

Computer Engineering 50th anniversary site. Next.js 16 frontend + FastAPI backend, SQLite storage. Runs under docker compose.

## Quick start (docker compose)

The API refuses to start without a non-default `JWT_SECRET`. Generate one into `.env` first, then build and seed:

```bash
# 1. Create the env file compose requires (one-time)
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env

# 2. Build + start the stack
docker compose up -d --build

# 3. Wait for the API to be healthy, then init + seed
docker compose exec api python db.py
docker compose exec api python seed.py
```

Web on http://localhost:3000 · API on http://localhost:8000

## Generating `JWT_SECRET`

`JWT_SECRET` must be a random 64-char hex string. Pick the one-liner for your OS and write it straight into `.env`:

**Linux / macOS** (requires `openssl`):

```bash
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
```

**Windows** (PowerShell — no extra deps, uses .NET RNG):

```powershell
$bytes = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); "JWT_SECRET=$($bytes | ForEach-Object { $_.ToString('x2') })" | Out-File -Encoding ascii .env
```

On Windows, `openssl` is usually absent — the PowerShell snippet avoids it. If you have Git Bash / WSL, the Linux line works there too.

## Notes

- `NEXT_PUBLIC_API_URL` is baked into the frontend bundle at build time. On a VPS, rebuild with the API's public URL: `NEXT_PUBLIC_API_URL=http://<host>:8000 docker compose up -d --build`.
- `API_INTERNAL_URL=http://api:8000` is set by compose so the web container's server-side fetches reach the API over the Docker network. Leave unset for local dev.

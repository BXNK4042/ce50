# CE50 Auth Report

Two-tier. Next 16 frontend + FastAPI backend. Custom JWT. No framework.

## Stack

- Frontend: Next 16.2.10 App Router, `[lang]` i18n. Zero auth deps. `package.json:10`
- Backend: FastAPI + `pyjwt` + custom pbkdf2. `server/requirements.txt:1`
- DB: SQLite, raw SQL, no ORM. `server/schema.sql:89`

## User table

`server/schema.sql:89-98`:

- `username`, `password_hash`, `email`, `role` (superadmin/admin/writer), `year` (1-based scoping).

## Flow

Login → client POST `/[lang]/api/admin/login` → Next forwards to FastAPI `/admin/login` → verify creds → return JWT `{sub, role, year}` HS256 24h. Next sets 3 cookies: `admin_token`, `admin_role`, `admin_year`. `app/[lang]/api/admin/login/route.ts:36-57`, `server/routers/auth.py:40-44`

Logout: clear cookies. `app/[lang]/api/admin/logout/route.ts:3`

## Storage

Cookies, not localStorage. `sameSite=lax`, `secure=prod`, 24h. `httpOnly: false` (intentional, frontend reads).

## Guards

1. **`proxy.ts:21`** — Next 16 proxy (renamed middleware) redirects `/[lang]/admin/*` to login if no cookie. Per docs: optimistic check only.
2. **Client cosmetic** — reads `admin_role`, shows "login required" screen.
3. **Backend `Depends(get_current_admin)`** — real enforcement. `server/dependencies.py:9`

## RBAC

`server/dependencies.py:39`:

- `superadmin` = god
- `admin` = mid
- `writer` = low
- Year-scoping declared but **never wired** at call sites → dead code.

Protected: news mutations `writer`+ (`server/routers/news.py:191,220,262,287`), schedule mutations `admin`+ (`server/routers/schedule.py:79,104`).

## Hashing

Custom pbkdf2_sha256, 100k rounds. `server/auth_utils.py:7`. `passlib[bcrypt]` in requirements but unused — dead dep.

## OAuth / CSRF

None. Password-only. No CSRF token, only `sameSite=lax` saves it.

## Triage (worst → least)

1. **Open register** — anyone self-creates `superadmin`. `server/routers/auth.py:53`
2. **`httpOnly: false`** — XSS = takeover. `app/[lang]/api/admin/login/route.ts:37`
3. **Proxy trust cookie presence only** — `admin_token=x` bypasses redirect. Real defense = backend bearer checks.
4. **Weak seeded passwords** in source (`super1234` etc). `server/seed.py:11`
5. **Default JWT secret** `super-secret-key-change-me`. `config.py:36`
6. **Year-scoping dead** — declared never enforced.
7. **No CSRF tokens**.
8. **`passlib[bcrypt]` dead dep**.

## File map

| Concern | Path |
|---|---|
| Proxy | `proxy.ts:7` |
| Next routes | `app/[lang]/api/admin/{login,register,logout}/route.ts` |
| FastAPI auth | `server/routers/auth.py` |
| JWT utils | `server/auth_utils.py:27` |
| Password | `server/auth_utils.py:7` |
| Auth deps | `server/dependencies.py` |
| Schema | `server/schema.sql:89` |
| Token helper | `lib/api.ts:153` |
| Seed | `server/seed.py:9` |

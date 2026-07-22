# Debug Plan — `run-dev.sh` backend crash

Skill: `superpowers:systematic-debugging`
Target: `RuntimeError: Directory '.../server/image' does not exist` at `server/main.py:31`

## Phase 1 — Root Cause Investigation (DONE)

### Error read
`StaticFiles.__init__` raises at `main.py:31` because `UPLOAD_DIR` is absent.

### Reproduction (consistent)
```bash
.venv/bin/python -m uvicorn main:app --app-dir server
# → crashes 100% on fresh checkout
```

### Recent changes (git)
```
2cb7fce chore(assets): remove orphan server/image dir   ← regression source
```
Before this commit, the directory was committed to the repo, so it existed
on every checkout and silently masked the import-time mount.

### Evidence at component boundaries
| Boundary | Result |
|----------|--------|
| `config.py` import + env load | OK |
| `JWT_SECRET` gate (`config.py:24`) | OK (passes) |
| `main.py` module body up to line 30 | OK |
| `StaticFiles(directory=UPLOAD_DIR)` at line 31 | **FAIL** |
| FastAPI lifespan → `init_db()` → `UPLOAD_DIR.mkdir()` | Never reached |

### Trace conclusion
`UPLOAD_DIR.mkdir(parents=True, exist_ok=True)` *does* exist — at
`server/db.py:27`, inside `init_db()`. But `init_db()` only runs in the
FastAPI **lifespan** (`main.py:15`), which executes **after** the module
body has already tried to mount `StaticFiles`. So the directory is created
later than the mount that needs it. On a checkout that no longer ships the
`server/image/` directory, the import crashes before lifespan ever runs.

## Phase 2 — Pattern Analysis (DONE)

- Working sibling: `app.mount("/Video", StaticFiles(directory=BASE_DIR / "video"))`
  works because `server/video/` is committed and present.
- The `/image` mount is identical in shape; the only difference is that its
  target directory is runtime-created (uploads), not a committed asset.
- README (`server/README.md:83`) documents that `init_db()` owns the
  `mkdir(UPLOAD_DIR)` — correct in intent, wrong in timing.

## Phase 3 — Hypothesis (DONE)

**Hypothesis:** Creating `UPLOAD_DIR` eagerly — before the `StaticFiles`
mount — will let `main.py` import successfully; `init_db()`'s later mkdir
remains as a harmless idempotent no-op.

**Minimal test of hypothesis:** run `mkdir -p server/image` and re-run
uvicorn. If it boots, hypothesis confirmed (this tests the *theory*, not
the fix — the real fix makes the mkdir happen automatically).

## Phase 4 — Implementation

### Step 1 — Failing test case (reproduction)

```bash
# Must fail before fix, pass after.
cd /home/bankrupt/ce50
.venv/bin/python -c "import sys; sys.path.insert(0, 'server'); import main; print('IMPORT OK')"
```

Expected pre-fix: `RuntimeError: Directory '.../server/image' does not exist`
Expected post-fix: `IMPORT OK`

### Step 2 — Single fix

Add eager mkdir of `UPLOAD_DIR` in `server/main.py` **before** the
`StaticFiles` mount. One line, placed at the top of the mounts block so
the ordering dependency is locally obvious.

```python
# server/main.py, before line 31
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/image", StaticFiles(directory=UPLOAD_DIR), name="image")
```

Rationale:
- Root-cause fix (removes the import-time vs lifespan ordering hazard),
  not a symptom patch.
- Does not touch `db.py:init_db()` (idempotent; still useful for
  `seed.py` / `import_students.py` which import `db` directly).
- No new abstraction, no config flag, no behavior change for existing
  setups that already have the directory.

Rejected alternatives:
- Re-committing `server/image/` — reintroduces the orphan-asset smell
  that `2cb7fce` cleaned up; breaks on any env where `UPLOAD_DIR` is
  overridden to a different path.
- `check_dir=False` on `StaticFiles` — Starlette has no such flag; the
  existence check is hardcoded in `__init__`.
- Moving the mkdir into `config.py` — import-time side effect in a config
  module is a wider blast radius than the mount site that needs it.

### Step 3 — Verify

1. Run the Step 1 repro → `IMPORT OK`
2. Boot uvicorn → reaches `Uvicorn running on http://...`
3. `GET /health` → `{"status":"ok"}`
4. Restart `run-dev.sh` end-to-end → both panes healthy, no errors in
   either tmux pane.

### Step 4 — If fix doesn't work

Per skill: stop after ≤2 retry hypotheses and question architecture. The
next architectural lever would be lazy-mounting static files inside the
lifespan (mount after `init_db()`), but that is not expected to be needed.

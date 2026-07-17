@echo off
:: =====================================================================
:: CE50 Development Environment Launcher
:: Starts both frontend (Next.js) and backend (FastAPI/Uvicorn)
:: =====================================================================

setlocal enabledelayedexpansion

:: Store the root directory (where this script resides) and remove trailing backslash
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

echo [1/3] Verifying project files...
if not exist "%PROJECT_ROOT%\package.json" (
    echo [ERROR] package.json not found in "%PROJECT_ROOT%".
    echo Please make sure this script is in the project root directory.
    pause
    exit /b 1
)

:: Check for node_modules
if not exist "%PROJECT_ROOT%\node_modules" (
    echo [WARNING] node_modules folder is missing. You might need to run: npm install
)

:: Locate Python Virtual Environment and Uvicorn
set "VENV_UVICORN=%PROJECT_ROOT%\.venv\Scripts\uvicorn.exe"
set "BACKEND_CMD="

if exist "%VENV_UVICORN%" (
    echo [2/3] Found Python virtual environment at .venv.
    set "BACKEND_CMD=.venv\Scripts\uvicorn main:app --reload --app-dir server"
) else (
    echo [2/3] Virtual environment not found at .venv. Will fall back to global uvicorn.
    set "BACKEND_CMD=uvicorn main:app --reload --app-dir server"
)

echo [3/3] Checking for Windows Terminal (wt)...
where wt >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Launching Windows Terminal with split panes...
    wt -d "%PROJECT_ROOT%" cmd /k "npm run dev" ^; split-pane -V -d "%PROJECT_ROOT%" cmd /k "%BACKEND_CMD%"
) else (
    echo [INFO] Windows Terminal (wt) not detected.
    echo Launching in separate Command Prompt windows...
    
    :: Launch frontend in a new CMD window
    start "CE50 Frontend (Next.js)" /D "%PROJECT_ROOT%" cmd /k "npm run dev"
    
    :: Launch backend in a new CMD window
    start "CE50 Backend (FastAPI)" /D "%PROJECT_ROOT%" cmd /k "%BACKEND_CMD%"
)

echo Done! The servers are starting.

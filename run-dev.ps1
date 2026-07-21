# =====================================================================
# CE50 Development Environment Launcher (PowerShell Version)
# Starts both frontend (Next.js) and backend (FastAPI/Uvicorn)
# =====================================================================

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (!$ProjectRoot) { $ProjectRoot = Get-Location }

Write-Host "[1/3] Verifying project files..." -ForegroundColor Cyan
if (!(Test-Path "$ProjectRoot\package.json")) {
    Write-Error "package.json not found in $ProjectRoot. Please run this script from the project root."
    Exit
}

# Check for node_modules
if (!(Test-Path "$ProjectRoot\node_modules")) {
    Write-Host "[WARNING] node_modules folder is missing. You might need to run: npm install" -ForegroundColor Yellow
}

# Locate Python Virtual Environment
$VenvPython = "$ProjectRoot\.venv\Scripts\python.exe"
if (!(Test-Path $VenvPython)) {
    $VenvPython = "$ProjectRoot\venv\Scripts\python.exe"
}
if (!(Test-Path $VenvPython)) {
    $VenvPython = "$ProjectRoot\.venv\bin\python.exe"
}
$BackendCmd = ""

if (Test-Path $VenvPython) {
    Write-Host "[2/3] Found Python virtual environment." -ForegroundColor Cyan
    $BackendCmd = "`"$VenvPython`" -m uvicorn main:app --reload --app-dir server"
} else {
    Write-Host "[2/3] Virtual environment not found. Will use 'py -m uvicorn'." -ForegroundColor Yellow
    $BackendCmd = "py -m uvicorn main:app --reload --app-dir server"
}

Write-Host "[3/3] Checking for Windows Terminal (wt)..." -ForegroundColor Cyan
if (Get-Command wt -ErrorAction SilentlyContinue) {
    Write-Host "Launching Windows Terminal with split panes..." -ForegroundColor Green
    wt -d "$ProjectRoot" cmd /k "npm run dev" `; split-pane -V -d "$ProjectRoot" cmd /k "$BackendCmd"
} else {
    Write-Host "[INFO] Windows Terminal (wt) not detected. Opening in separate Command Prompt windows..." -ForegroundColor Yellow
    Start-Process cmd -ArgumentList "/k", "npm run dev" -WorkingDirectory $ProjectRoot
    Start-Process cmd -ArgumentList "/k", $BackendCmd -WorkingDirectory $ProjectRoot
}

Write-Host "Done! The servers are starting." -ForegroundColor Green

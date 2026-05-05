@echo off
title Carl Service Marketplace Launcher

echo.
echo ========================================
echo   Carl Service Marketplace
echo   Starting development servers...
echo ========================================
echo.

:: Check Node is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Download it from https://nodejs.org
    pause
    exit /b 1
)

:: Start Backend in a new window
echo [1/2] Starting Backend API on http://localhost:5000 ...
start "Carl Backend API" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend in a new window
echo [2/2] Starting Frontend React on http://localhost:3000 ...
start "Carl Frontend React" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo Both servers are starting in separate windows.
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo   Admin login: carl@carlservices.com
echo   Password:    Admin@Carl2024
echo.
echo Press any key to close this launcher...
pause >nul

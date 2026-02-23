@echo off
title DiaAstro Frontend
echo.
echo ============================================
echo   DiaAstro React Frontend - Starting...
echo ============================================
echo.

:: Navigate to the React project folder (edit this path if needed)
cd /d "%~dp0"

:: Check Node is available
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not on PATH.
    echo Download from https://nodejs.org
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
)

:: Start React dev server
echo.
echo Starting React app on http://localhost:3000
echo Press Ctrl+C to stop.
echo.
npm start

pause

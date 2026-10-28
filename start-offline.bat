@echo off
title CodeBuddy AI - 100%% Offline Mode
color 0b

echo ==============================================================
echo           CodeBuddy AI - 100%% Offline Mode Launcher
echo ==============================================================
echo.
echo [1/3] Checking Local Ollama AI Engine...
ollama list >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Starting Ollama background service...
    start /b ollama serve
    timeout /t 2 /nobreak >nul
) else (
    echo [v] Ollama is active and ready!
)

echo.
echo [2/3] Starting Local Backend (Port 5000) ^& Frontend (Port 5173)...
echo.
echo [*] Opening CodeBuddy AI in your browser...
start "" "http://localhost:5173"

echo.
echo ==============================================================
echo   CodeBuddy is running 100%% locally with Ollama (gemma3:1b).
echo   You can shut down your Wi-Fi / Internet and it will still work!
echo   Keep this window open while using CodeBuddy.
echo ==============================================================
echo.

npm run dev:all

Frontend Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "          CodeBuddy AI - 100% Offline Mode Launcher" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Checking Local Ollama AI Engine..." -ForegroundColor Yellow
try {
    $res = ollama list 2>$null
    Write-Host "[v] Ollama is active with installed models:" -ForegroundColor Green
    $res | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
}
catch {
    Write-Host "[*] Starting Ollama serve..." -ForegroundColor Yellow
    Start-Process -NoNewWindow ollama -ArgumentList "serve"
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "[2/3] Starting Local Backend (5000) & Frontend (5173)..." -ForegroundColor Yellow
Write-Host "[*] Launching browser at http://localhost:5173..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "  CodeBuddy is running 100% locally with Ollama (gemma3:1b)." -ForegroundColor Green
Write-Host "  You can shut down your Wi-Fi / Internet and it will still work!" -ForegroundColor Green
Write-Host "  Keep this terminal open while using CodeBuddy." -ForegroundColor DarkYellow
Write-Host "==============================================================" -ForegroundColor Green
Write-Host ""

npm run dev:all


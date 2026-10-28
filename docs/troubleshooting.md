# CodeBuddy AI — Troubleshooting & Diagnostics Guide

This guide covers common development and deployment issues encountered by beginners and seasoned engineers when setting up CodeBuddy AI.

---

## 1. Ollama Issues

### Problem: `connect ECONNREFUSED 127.0.0.1:11434`
- **Cause**: The local Ollama server is not running.
- **Fix**:
  1. Open a new PowerShell terminal.
  2. Run `ollama serve` or launch the Ollama desktop application from the Windows Start menu.
  3. Verify by opening `http://127.0.0.1:11434/` in your browser. You should see `"Ollama is running"`.

### Problem: `model 'gemma3:1b' not found`
- **Cause**: The specified Gemma model has not been downloaded to your local Ollama cache.
- **Fix**:
  ```powershell
  ollama pull gemma3:1b
  ```
  Test it in terminal:
  ```powershell
  ollama run gemma3:1b "Hello"
  ```

---

## 2. Gemini API Issues

### Problem: `GEMINI_API_KEY is not set`
- **Cause**: Backend `.env` is missing `GEMINI_API_KEY`.
- **Fix**: Add a valid Gemini key to `backend/.env`:
  ```ini
  GEMINI_API_KEY=your_actual_gemini_api_key_here
  GEMINI_MODEL=gemini-3.8-flash
  ```

### Problem: `Resource has been exhausted (quota / rate limit)`
- **Cause**: Free tier Gemini quota limit reached.
- **Fix**: Switch back to local Ollama by setting `AI_PROVIDER=ollama` in `backend/.env` and restart the backend. No cost, unlimited local queries!

---

## 3. Supabase & Database Issues

### Problem: `PGRST301 JWT expired or invalid`
- **Cause**: User's Supabase auth session token has expired.
- **Fix**: Log out and log back in on the frontend. The frontend `supabaseClient` automatically refreshes valid refresh tokens.

### Problem: `Database tables do not exist`
- **Cause**: Migrations have not been applied to your Supabase project.
- **Fix**: Open the Supabase Dashboard $\rightarrow$ **SQL Editor**, paste the contents of `supabase/migrations/20261028000000_create_codebuddy_schema.sql`, and click **Run**.

---

## 4. Port Conflicts

### Problem: `Error: listen EADDRINUSE: address already in use :::5000`
- **Cause**: Another process is occupying port 5000.
- **Fix in PowerShell**:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```
  Or change `PORT=5001` in `backend/.env`.

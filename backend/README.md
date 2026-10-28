# CodeBuddy AI — Backend API & AI Engine

> **Tagline**: *Learn to Code. Understand the Logic. Build Confidence.*  
> Dedicated REST API & AI tutoring service built for undergraduate engineering students mastering **Python**, **C**, **C++**, and **JavaScript**.

---

## 🚀 Overview

The CodeBuddy AI Backend provides a resilient, modular **Model-View-Controller (MVC)** REST API powering:
- **Line-by-Line Code Explanation**: AST & statement deconstruction without arbitrary execution risks.
- **AI Logic Debugging**: Error mechanism diagnosis distinguishing syntax certainty from logical/runtime hypotheses.
- **5-Tier Socratic Hint Hierarchy**: Progressive hint generation (Conceptual $\rightarrow$ Approach $\rightarrow$ Pseudocode $\rightarrow$ Partial Code $\rightarrow$ Full Solution).
- **Multi-Turn Conversational Tutor**: Socratic dialogue guiding student thought processes.
- **Dual AI Provider Architecture**: Seamless switching between **Local Ollama (Gemma 3:1B)** and **Google Gemini (`@google/genai`)**.
- **Database & Authentication**: Supabase (PostgreSQL with Row Level Security) with automatic in-memory mock database fallback for 100% offline development.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js v18+ (tested on v24, Native ECMAScript Modules `import` / `export`)
- **Web Framework**: Express.js
- **Security & Hygiene**:
  - `helmet`: Hardens HTTP headers
  - `cors`: Restricted cross-origin resource sharing
  - `express-rate-limit`: Prevents endpoint abuse & quota exhaustion
  - `zod`: Strict declarative schema validation on all incoming request payloads
- **AI Integration**:
  - Google Gen AI SDK (`@google/genai`) for Gemini models
  - Native HTTP REST connector for local Ollama instances
- **Database**:
  - Supabase client (`@supabase/supabase-js`)
  - In-memory mock database for offline fallback

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── config/             # Environment variable parsing and validation
│   ├── controllers/        # Request controllers (AI, Practice, Dashboard, Auth)
│   ├── middleware/         # Security headers, auth verification, error handling, rate limiting
│   ├── routes/             # Express API routes
│   ├── services/
│   │   ├── ai/             # AI Provider abstraction (Ollama, Gemini, Service layer)
│   │   └── supabase/       # Supabase client and in-memory mock database
│   ├── utils/              # JSON sanitization, markdown fence parsing
│   ├── validators/         # Zod schemas for input validation
│   ├── app.js              # Express application assembly
│   └── server.js           # Server entry point
├── tests/                  # Unit and integration test suites
├── .env.example            # Sample environment configuration
├── package.json
└── README.md
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# Database & Auth (Optional: defaults to offline demo database if unconfigured)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# AI Provider Configuration ('ollama' or 'gemini')
AI_PROVIDER=ollama

# Ollama Settings (Local Gemma 3)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma3:1b

# Gemini Settings (Cloud)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000` with native hot-reloading (`--watch`).

### 3. Run Test Suites
```bash
npm test
```

---

## 📡 API Endpoints

### Health & Provider Telemetry
- `GET /api/health` — Returns server uptime and status.
- `GET /api/health/ai` — Checks connectivity, active provider, model name, and latency.

### AI Pedagogical Capabilities
- `POST /api/ai/explain` — Line-by-line explanation and concept breakdown.
- `POST /api/ai/debug` — Bug root cause, minimal fix snippet, and prevention tips.
- `POST /api/ai/practice/generate` — Creates curriculum problems by language, topic, and difficulty.
- `POST /api/ai/hints` — Progressive hint retrieval (Levels 1 to 4).
- `POST /api/ai/solution` — Explicit Level 5 reference solution with pedagogical walkthrough.
- `POST /api/ai/chat` — Multi-turn conversational Socratic tutoring.

### Practice & Learning Analytics
- `GET /api/practice` — Lists student practice problems.
- `POST /api/practice/:id/attempts` — Records problem attempts and hints used.
- `GET /api/dashboard/stats` — Aggregates genuine learning streak, completed problems, and language frequency.

---

## 🛡️ Educational Safety Guarantee

CodeBuddy AI strictly **analyzes and explains** student code using LLM reasoning. It **never** executes untrusted student code on the host server via `eval()` or unconfined subprocesses.

---

## 📄 License

MIT License. Designed with care for Hacktoberfest.

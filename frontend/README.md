# CodeBuddy AI — Frontend Web Application

> **Tagline**: *Learn to Code. Understand the Logic. Build Confidence.*  
> Modern, high-performance Single Page Application (SPA) designed for undergraduate engineering students learning **Python**, **C**, **C++**, and **JavaScript**.

---

## 🚀 Overview

The **CodeBuddy AI Frontend** provides an intuitive, dark-first developer experience built with **React 18**, **Vite**, **Tailwind CSS**, and the industry-standard **Monaco Editor** (the engine behind VS Code).

### Key Features
- 💻 **Interactive Workspace**: Split-view editor with tabs for statement explanation, error debugging, and Socratic hints.
- 🔍 **Line-by-Line Explainer**: Deconstructs source code line by line with purpose explanations and related concept examples.
- 🐛 **Socratic AI Debugger**: Identifies syntax and logical errors, shows targeted diff fixes, and provides prevention tips.
- 🎯 **Practice Arena & 5-Tier Hint Ladder**: Curriculum problem challenges with graduated hints (Conceptual $\rightarrow$ Approach $\rightarrow$ Pseudocode $\rightarrow$ Partial Code $\rightarrow$ Full Solution).
- 💬 **Socratic AI Tutor**: Conversational chat assistant that guides student reasoning rather than spoon-feeding answers.
- 📊 **Learning Analytics Dashboard**: Animated charts powered by **Recharts** tracking 7-day activity frequencies, streaks, and language proficiency.
- ⚡ **Instant Demo Mode**: 1-click guest access without requiring external database setup.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) with custom dark palette (`#0B0F19`, `#151E33`, `#38BDF8`, `#818CF8`)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **Charts & Data Viz**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/) (v7 future flags enabled)
- **HTTP Client**: [Axios](https://axios-http.com/) with request/response interceptors and automatic Bearer token injection
- **Authentication**: [Supabase Auth](https://supabase.com/) with offline local demo session fallback

---

## 📁 Directory Structure

```text
frontend/
├── src/
│   ├── components/         # CodeEditor, Navbar, ProviderBadge, Footer
│   ├── contexts/           # AuthContext (Supabase + Demo Mode), ToastContext
│   ├── pages/
│   │   ├── Home.jsx        # Landing page & feature showcase
│   │   ├── Workspace.jsx   # Interactive coding sandbox with AI tabs
│   │   ├── Explainer.jsx   # Line-by-line code explanation page
│   │   ├── Debugger.jsx    # Socratic logic & syntax debugger
│   │   ├── Practice.jsx    # Curriculum practice arena & 5-level hint ladder
│   │   ├── ChatTutor.jsx   # Conversational AI tutor with session history
│   │   ├── Dashboard.jsx   # Learning telemetry & visual charts (Recharts)
│   │   ├── History.jsx     # Searchable submissions archive
│   │   ├── Login.jsx       # Student login with 1-click Demo mode
│   │   ├── Register.jsx    # Account registration
│   │   └── Profile.jsx     # Profile management & AI engine telemetry
│   ├── services/
│   │   ├── api.js          # REST API client matching backend routes
│   │   └── supabase.js     # Supabase client initializer
│   ├── utils/
│   │   └── constants.js    # Supported languages, curriculum topics, hints
│   ├── App.jsx             # Top-level routing & layout shell
│   ├── index.css           # Global design system & custom scrollbars
│   └── main.jsx            # Application entrypoint
├── index.html              # HTML shell with Inter & JetBrains Mono fonts
├── tailwind.config.js      # Tailwind color palette & glow animations
├── vite.config.js          # Vite configuration
├── package.json
└── README.md
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your configuration:

```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Optional: Supabase Credentials (leave default for instant offline demo mode)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```
Optimized assets will be generated in `dist/`.

---

## 📄 License

MIT License. Built for Hacktoberfest.


import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Bug,
  BookOpen,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Terminal,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, HINT_LEVELS } from '../utils/constants.js';

export default function Home() {
  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-indigo/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-8 relative">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-indigo/30 bg-brand-indigo/10 text-brand-blue text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
            <span>Dedicated AI Programming Tutor for Undergraduate Engineers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Learn to Code. <br className="hidden sm:inline" />
            <span className="text-gradient">Understand the Logic.</span> <br />
            Build Confidence.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Stop copying solutions from stack forums or opaque chatbots. CodeBuddy AI teaches you
            <strong className="text-white"> why</strong> code works with line-by-line breakdowns, 5-tier progressive hints, and intelligent bug diagnosis.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/workspace"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-blue text-white shadow-glow-md hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              Open Interactive Workspace
            </Link>
            <Link
              to="/practice"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-200 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-brand-blue" />
              Practice with Socratic Hints
            </Link>
          </div>

          {/* Languages supported pill row */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Curriculum Languages:</span>
            {SUPPORTED_LANGUAGES.map((l) => (
              <span
                key={l.id}
                className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-dark-800 border border-dark-700 text-slate-200"
              >
                {l.name}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Pedagogical Features Built for Beginners
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Traditional AI gives away complete answers instantly, denying students the opportunity to learn. CodeBuddy AI scaffolds your learning path.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Line-by-Line Explainer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Step through your program statement by statement. Understand variable assignments, loop invariants, and recursive calls in plain English.
            </p>
            <Link to="/explainer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline">
              Try Code Explainer <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Bug className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Logic Debugger</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Paste your broken code and error messages. CodeBuddy flags off-by-one errors, infinite loops, and type mismatches with prevention tips.
            </p>
            <Link to="/debugger" className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:underline">
              Debug Your Code <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-violet">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">5-Tier Socratic Hints</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Never get stuck without help. Move progressively from Conceptual guidance to Approach, Pseudocode, and Partial Code before unlocking solutions.
            </p>
            <Link to="/practice" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-violet hover:underline">
              Explore Practice Arena <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-brand-indigo">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Local-First or Cloud AI</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Works completely offline with local Ollama Gemma 3:1B for zero-cost, private student lab computers, or connects to Google Gemini in the cloud.
            </p>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Ollama & Gemini Compatible</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Real Learning Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track your daily coding consistency, language proficiency, and hint dependency. All statistics compute from real persisted database attempts.
            </p>
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline">
              View Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 6 */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Honest AI Verification</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transparent indicators label AI-generated responses. Syntax checks are clearly separated from runtime hypotheses with zero fabricated outputs.
            </p>
            <div className="text-xs font-mono text-amber-400 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero Fake Output Guarantee</span>
            </div>
          </div>

        </div>
      </section>

      {/* Socratic Ladder Diagram */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 rounded-3xl border border-brand-indigo/30 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase font-semibold text-brand-blue tracking-wider">
              Educational Framework
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              The 5-Level Socratic Hint Hierarchy
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Our graduated progression ensures students write their own logic rather than relying on autopilot code generation.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {HINT_LEVELS.map((h) => (
              <div
                key={h.level}
                className="flex items-center justify-between p-4 rounded-xl bg-dark-850/80 border border-dark-700 hover:border-brand-indigo/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-7 h-7 rounded-lg bg-brand-indigo/20 text-brand-blue font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    L{h.level}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{h.title}</h4>
                    <p className="text-xs text-slate-400">{h.desc}</p>
                  </div>
                </div>
                {h.level === 5 ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Requires Confirmation
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-brand-blue/10 text-brand-blue">
                    Scaffolded
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Jump CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-indigo/20 via-brand-violet/20 to-brand-blue/20 border border-brand-indigo/30 text-center space-y-6 backdrop-blur-md">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to master programming fundamentals?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Get started right inside your browser. No credit card or installation required to explore in demo mode.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/workspace"
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-white text-dark-900 hover:bg-slate-100 shadow-xl transition-all"
            >
              Start Coding Now
            </Link>
            <Link
              to="/practice"
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-dark-900/80 text-white hover:bg-dark-900 border border-dark-700 transition-colors"
            >
              Solve Practice Problems
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}


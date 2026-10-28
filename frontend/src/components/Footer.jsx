import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Heart, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-700 bg-dark-950/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-blue flex items-center justify-center text-white font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">CodeBuddy AI</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-indigo/20 text-brand-blue border border-brand-indigo/30">
              v1.0
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Educational AI tutor designed for first-year engineering students. Master programming logic in Python, C, C++, and JavaScript through Socratic hints and line-by-line understanding.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Educational sandbox: AI explanations without remote arbitrary code execution.</span>
          </div>
        </div>

        {/* Modules Col */}
        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4 font-mono">
            Learning Modules
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/explainer" className="hover:text-brand-blue transition-colors">
                Line-by-Line Explainer
              </Link>
            </li>
            <li>
              <Link to="/debugger" className="hover:text-brand-blue transition-colors">
                AI Bug Debugger
              </Link>
            </li>
            <li>
              <Link to="/practice" className="hover:text-brand-blue transition-colors">
                Practice Arena & Hints
              </Link>
            </li>
            <li>
              <Link to="/chat" className="hover:text-brand-blue transition-colors">
                Socratic AI Tutor
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-brand-blue transition-colors">
                Learning Analytics
              </Link>
            </li>
          </ul>
        </div>

        {/* Supported Languages */}
        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4 font-mono">
            Curriculum
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-dark-800 border border-dark-700 text-slate-300 font-mono">
              Python 3
            </span>
            <span className="px-2.5 py-1 rounded-md bg-dark-800 border border-dark-700 text-slate-300 font-mono">
              C (C99/C11)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-dark-800 border border-dark-700 text-slate-300 font-mono">
              C++ (C++17)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-dark-800 border border-dark-700 text-slate-300 font-mono">
              JavaScript (ES6+)
            </span>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-dark-900 border border-dark-700 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-brand-violet font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hybrid AI</span>
            </div>
            Runs locally on Ollama (Gemma 3:1B) or cloud via Google Gemini.
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-dark-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} CodeBuddy AI. Built for Computer Science learners.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Crafted with care for Hacktoberfest
        </p>
      </div>
    </footer>
  );
}


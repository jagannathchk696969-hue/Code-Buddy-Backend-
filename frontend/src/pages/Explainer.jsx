import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  Loader2,
  Lightbulb,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  FileCode2,
  ArrowRight
} from 'lucide-react';
import CodeEditor from '../components/CodeEditor.jsx';
import { SUPPORTED_LANGUAGES } from '../utils/constants.js';
import { aiApi } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';

export default function Explainer() {
  const toast = useToast();
  const [language, setLanguage] = useState('python');
  const starter = SUPPORTED_LANGUAGES.find((l) => l.id === 'python')?.starter || '';
  const [code, setCode] = useState(starter);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeLine, setActiveLine] = useState(null);

  const handleLanguageSelect = (langId) => {
    setLanguage(langId);
    const newStarter = SUPPORTED_LANGUAGES.find((l) => l.id === langId)?.starter || '';
    setCode(newStarter);
    setResult(null);
    setActiveLine(null);
  };

  const handleExplain = async () => {
    if (!code.trim()) {
      toast.warning('Please enter code to explain.');
      return;
    }
    setLoading(true);
    setActiveLine(null);
    try {
      const res = await aiApi.explain(language, code);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Explanation ready!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to explain code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold">
          <Code2 className="w-3.5 h-3.5" />
          <span>Line-by-Line Code Comprehension</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Code Explainer
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Break down any program into digestible statements. Understand what each line does, why it exists, and the programming principles behind it.
        </p>
      </div>

      {/* Language Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono uppercase text-slate-400 font-semibold mr-1">Select Language:</span>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => handleLanguageSelect(lang.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
              language === lang.id
                ? 'bg-brand-indigo text-white shadow-glow-sm'
                : 'bg-dark-800 text-slate-300 hover:bg-dark-750 hover:text-white border border-dark-700'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Editor & Action Row */}
      <div className="space-y-4">
        <CodeEditor
          language={language}
          value={code}
          onChange={setCode}
          height="320px"
          onResetStarter={() => {
            const s = SUPPORTED_LANGUAGES.find((l) => l.id === language)?.starter || '';
            setCode(s);
          }}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-mono">
            Line numbers in the editor correspond directly to the breakdown below.
          </p>
          <button
            onClick={handleExplain}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-indigo to-brand-blue text-white shadow-glow-sm hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Explain This Code
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-dark-850 border border-dark-700 space-y-4">
          <Loader2 className="w-8 h-8 text-brand-blue animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-white">Analyzing AST & Statement Logic...</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Deconstructing each statement into beginner-friendly explanations with conceptual context.
          </p>
        </div>
      )}

      {/* Results Section */}
      {!loading && result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          {/* Overview Summary & Concepts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-dark-850 to-dark-800 border border-brand-blue/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-blue">
                <Sparkles className="w-4 h-4" />
                <span>Program Purpose Summary</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {result.summary}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase text-slate-400 block">
                Target Concepts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.concepts?.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-dark-800 border border-dark-700 text-brand-blue"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Line-by-Line Breakdown Table / List */}
          {result.lineByLine?.length > 0 && (
            <div className="rounded-2xl border border-dark-700 bg-dark-850 overflow-hidden shadow-xl">
              <div className="px-5 py-3.5 bg-dark-900 border-b border-dark-700 flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                  Detailed Line-by-Line Breakdown
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {result.lineByLine.length} statements analyzed
                </span>
              </div>

              <div className="divide-y divide-dark-700">
                {result.lineByLine.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveLine(item.line)}
                    className={`p-4 transition-colors cursor-pointer ${
                      activeLine === item.line
                        ? 'bg-brand-indigo/10 border-l-4 border-l-brand-blue'
                        : 'hover:bg-dark-800/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      
                      {/* Line Number Badge */}
                      <div className="shrink-0">
                        <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded bg-dark-800 border border-dark-700 text-xs font-mono font-bold text-brand-violet">
                          Line {item.line}
                        </span>
                      </div>

                      {/* Code Snippet */}
                      <div className="sm:w-1/3 shrink-0">
                        <code className="text-xs font-mono px-2 py-1 rounded bg-dark-950 text-slate-200 block truncate">
                          {item.code}
                        </code>
                      </div>

                      {/* Educational Explanation */}
                      <div className="flex-1 text-xs text-slate-300 leading-relaxed font-sans">
                        {item.explanation}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Statements & Related Concept */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {result.keyStatements?.length > 0 && (
              <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-brand-indigo" />
                  Key Statement Insights
                </h4>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                  {result.keyStatements.map((stmt, i) => (
                    <li key={i}>{stmt}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.relatedExample && (
              <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    {result.relatedExample.title || 'Related Concept Example'}
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.relatedExample.code);
                      toast.success('Snippet copied!');
                    }}
                    className="text-xs text-brand-blue hover:underline"
                  >
                    Copy Snippet
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-dark-950 font-mono text-xs text-emerald-300 overflow-x-auto border border-dark-700">
                  {result.relatedExample.code}
                </pre>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {result.relatedExample.explanation}
                </p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}


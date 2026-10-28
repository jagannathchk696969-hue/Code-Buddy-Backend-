import React, { useState } from 'react';
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import CodeEditor from '../components/CodeEditor.jsx';
import { SUPPORTED_LANGUAGES } from '../utils/constants.js';
import { aiApi } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';

// Common buggy snippets for first-year students to test
const BUGGY_SAMPLES = {
  python: {
    code: `# Off-by-one bug in list indexing\nnumbers = [10, 20, 30, 40]\nfor i in range(len(numbers) + 1):\n    print("Item at index", i, "is", numbers[i])`,
    error: 'IndexError: list index out of range',
    expected: 'Print all 4 items without crashing'
  },
  c: {
    code: `// Uninitialized variable & missing format specifier\n#include <stdio.h>\n\nint main() {\n    int count;\n    printf("Count is: %d\\n", count);\n    return 0;\n}`,
    error: 'Prints unpredictable garbage memory value',
    expected: 'Count initialized to 0 and printed properly'
  },
  cpp: {
    code: `// Vector boundary violation\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {1, 2, 3};\n    cout << nums[5] << endl;\n    return 0;\n}`,
    error: 'Undefined behavior / Segmentation fault',
    expected: 'Safe access within vector bounds'
  },
  javascript: {
    code: `// Async mistake / unexpected NaN\nfunction addNumbers(a, b) {\n    return a + b;\n}\n\nlet x;\nlet y = 10;\nconsole.log("Result:", addNumbers(x, y));`,
    error: 'Prints NaN instead of a number',
    expected: 'Handles undefined inputs or default values'
  }
};

export default function Debugger() {
  const toast = useToast();
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(BUGGY_SAMPLES.python.code);
  const [errorMessage, setErrorMessage] = useState(BUGGY_SAMPLES.python.error);
  const [expectedBehavior, setExpectedBehavior] = useState(BUGGY_SAMPLES.python.expected);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedFix, setCopiedFix] = useState(false);

  const handleLanguageSelect = (langId) => {
    setLanguage(langId);
    const sample = BUGGY_SAMPLES[langId] || { code: '', error: '', expected: '' };
    setCode(sample.code);
    setErrorMessage(sample.error);
    setExpectedBehavior(sample.expected);
    setResult(null);
  };

  const handleDebug = async () => {
    if (!code.trim()) {
      toast.warning('Please enter code to debug.');
      return;
    }
    setLoading(true);
    try {
      const res = await aiApi.debug(language, code, errorMessage, expectedBehavior);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Diagnosis completed!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to debug code.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFix = () => {
    if (result?.suggestedCorrection) {
      setCode(result.suggestedCorrection);
      toast.success('Suggested correction applied to editor!');
    }
  };

  const handleCopyFix = async () => {
    if (result?.suggestedCorrection) {
      await navigator.clipboard.writeText(result.suggestedCorrection);
      setCopiedFix(true);
      setTimeout(() => setCopiedFix(false), 2000);
      toast.success('Correction copied to clipboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          <Bug className="w-3.5 h-3.5" />
          <span>Socratic AI Logic Debugger</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Debug Code & Logic
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Diagnose bugs, runtime exceptions, and subtle logical misunderstandings. CodeBuddy explains the underlying mechanism causing the bug and shows you how to avoid it.
        </p>
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono uppercase text-slate-400 font-semibold mr-1">Language:</span>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => handleLanguageSelect(lang.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
              language === lang.id
                ? 'bg-rose-600 text-white shadow-glow-sm'
                : 'bg-dark-800 text-slate-300 hover:bg-dark-750 hover:text-white border border-dark-700'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Inputs: Code Editor + Error Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
            height="380px"
            title="Problematic Code"
          />
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Edit or paste your code snippet above</span>
            <button
              onClick={() => {
                const sample = BUGGY_SAMPLES[language];
                if (sample) {
                  setCode(sample.code);
                  setErrorMessage(sample.error);
                  setExpectedBehavior(sample.expected);
                }
              }}
              className="text-brand-blue hover:underline"
            >
              Load Sample Student Bug
            </button>
          </div>
        </div>

        {/* Diagnostic Context Form (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-dark-850 border border-dark-700 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider">
              Error Telemetry & Context
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Observed Error / Crash Message</span>
                <span className="text-[10px] text-slate-500 font-mono">Optional</span>
              </label>
              <textarea
                rows={3}
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="Paste compiler error, traceback, or abnormal output..."
                className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Expected Behavior</span>
                <span className="text-[10px] text-slate-500 font-mono">Optional</span>
              </label>
              <textarea
                rows={3}
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="What did you expect the program to output or do?"
                className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDebug}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-glow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Diagnosing Logic...</span>
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4" />
                  <span>Diagnose & Suggest Fix</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Results Section */}
      {!loading && result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          {/* Issue Header Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-dark-850 to-dark-850 border border-rose-500/30 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Issue Summary</span>
              </div>
              {result.confidenceNote && (
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-dark-800 border border-dark-700 text-slate-300">
                  {result.confidenceNote}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-100">{result.problemDescription}</p>
          </div>

          {/* Probable Cause & Relevant Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700 space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                Why this happens (Under the hood)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {result.probableCause}
              </p>
            </div>

            {result.preventionTip && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  Pro-Active Prevention Tip
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.preventionTip}
                </p>
              </div>
            )}

          </div>

          {/* Suggested Minimal Correction */}
          {result.suggestedCorrection && (
            <div className="p-5 rounded-2xl bg-dark-850 border border-emerald-500/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
                    Targeted Correction
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyFix}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-800 hover:bg-dark-750 text-slate-300 transition-colors"
                  >
                    {copiedFix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFix ? 'Copied' : 'Copy Fix'}</span>
                  </button>
                  <button
                    onClick={handleApplyFix}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Apply to Editor</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-dark-950 font-mono text-xs text-emerald-300 overflow-x-auto border border-dark-700">
                {result.suggestedCorrection}
              </pre>

              {result.whyItWorks && (
                <div className="text-xs text-slate-300 font-sans space-y-1">
                  <span className="text-slate-400 font-mono uppercase text-[10px] font-semibold block">
                    Why this correction fixes the issue:
                  </span>
                  <p className="leading-relaxed">{result.whyItWorks}</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}


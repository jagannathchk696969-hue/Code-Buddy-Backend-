import React, { useState } from 'react';
import {
  Code2,
  Bug,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ExternalLink,
  Layers
} from 'lucide-react';
import CodeEditor from '../components/CodeEditor.jsx';
import { SUPPORTED_LANGUAGES, HINT_LEVELS } from '../utils/constants.js';
import { aiApi } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';

export default function Workspace() {
  const toast = useToast();
  const [selectedLang, setSelectedLang] = useState('python');
  
  // Initialize code with Python starter template
  const defaultStarter = SUPPORTED_LANGUAGES.find((l) => l.id === 'python')?.starter || '';
  const [code, setCode] = useState(defaultStarter);

  // Active right-panel tab: 'explain' | 'debug' | 'hints'
  const [activeTab, setActiveTab] = useState('explain');
  const [loading, setLoading] = useState(false);

  // Results
  const [explainResult, setExplainResult] = useState(null);
  const [debugResult, setDebugResult] = useState(null);
  const [hintResult, setHintResult] = useState(null);

  // Debugger inputs
  const [errorMessage, setErrorMessage] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');

  // Hints inputs
  const [problemTitle, setProblemTitle] = useState('Calculate Sum of Array');
  const [problemDescription, setProblemDescription] = useState('Write a program to sum an array of numbers.');
  const [hintLevel, setHintLevel] = useState(1);

  // Switch language and optionally replace starter
  const handleLanguageChange = (newLang) => {
    setSelectedLang(newLang);
    const starter = SUPPORTED_LANGUAGES.find((l) => l.id === newLang)?.starter || '';
    setCode(starter);
    setExplainResult(null);
    setDebugResult(null);
    setHintResult(null);
  };

  // Explain Code Action
  const handleExplain = async () => {
    if (!code.trim()) {
      toast.warning('Please enter or paste code to explain.');
      return;
    }
    setActiveTab('explain');
    setLoading(true);
    try {
      const res = await aiApi.explain(selectedLang, code);
      if (res.success && res.data) {
        setExplainResult(res.data);
        toast.success('Code explained successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to explain code.');
    } finally {
      setLoading(false);
    }
  };

  // Debug Code Action
  const handleDebug = async () => {
    if (!code.trim()) {
      toast.warning('Please enter or paste code to debug.');
      return;
    }
    setActiveTab('debug');
    setLoading(true);
    try {
      const res = await aiApi.debug(selectedLang, code, errorMessage, expectedBehavior);
      if (res.success && res.data) {
        setDebugResult(res.data);
        toast.success('Code analysis complete!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to debug code.');
    } finally {
      setLoading(false);
    }
  };

  // Request Hint Action
  const handleRequestHint = async (levelToRequest) => {
    const lvl = levelToRequest || hintLevel;
    setActiveTab('hints');
    setLoading(true);
    try {
      const res = await aiApi.getHint(selectedLang, problemTitle, problemDescription, lvl, code);
      if (res.success && res.data) {
        setHintResult(res.data);
        setHintLevel(lvl);
        toast.success(`Unlocked Level ${lvl} hint!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch hint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Control Bar: Language Switcher & Fast Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-dark-850 border border-dark-700 shadow-md">
        
        {/* Language selector buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold mr-1">Language:</span>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                selectedLang === lang.id
                  ? 'bg-brand-indigo text-white shadow-glow-sm'
                  : 'bg-dark-800 text-slate-300 hover:bg-dark-750 hover:text-white border border-dark-700'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExplain}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-blue/15 text-brand-blue border border-brand-blue/30 hover:bg-brand-blue/25 transition-all disabled:opacity-50"
          >
            {loading && activeTab === 'explain' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Code2 className="w-3.5 h-3.5" />}
            Explain Code
          </button>

          <button
            onClick={handleDebug}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all disabled:opacity-50"
          >
            {loading && activeTab === 'debug' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bug className="w-3.5 h-3.5" />}
            Debug Issues
          </button>

          <button
            onClick={() => handleRequestHint(1)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-violet/15 text-brand-violet border border-brand-violet/30 hover:bg-brand-violet/25 transition-all disabled:opacity-50"
          >
            {loading && activeTab === 'hints' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HelpCircle className="w-3.5 h-3.5" />}
            Get Hint
          </button>
        </div>

      </div>

      {/* Main Workspace: 2-Column Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Monaco Code Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <CodeEditor
            language={selectedLang}
            value={code}
            onChange={setCode}
            height="560px"
            onResetStarter={() => {
              const starter = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang)?.starter || '';
              setCode(starter);
            }}
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-2">
            <span>Editor: Monaco VS Code Core</span>
            <span>Educational sandbox: No arbitrary code execution</span>
          </div>
        </div>

        {/* Right Column: AI Assistant Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-xl border border-dark-700 bg-dark-850 shadow-xl overflow-hidden h-[600px]">
          
          {/* Panel Header Tabs */}
          <div className="flex items-center border-b border-dark-700 bg-dark-900/60 px-2 pt-2 gap-1">
            <button
              onClick={() => setActiveTab('explain')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'explain'
                  ? 'border-brand-blue text-brand-blue bg-dark-850'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Explainer
            </button>

            <button
              onClick={() => setActiveTab('debug')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'debug'
                  ? 'border-rose-400 text-rose-400 bg-dark-850'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              Debugger
            </button>

            <button
              onClick={() => setActiveTab('hints')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'hints'
                  ? 'border-brand-violet text-brand-violet bg-dark-850'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Hints (L1-4)
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3 py-16 text-center">
                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                <p className="text-sm font-semibold text-slate-200">Analyzing code with AI...</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Generating pedagogical explanation suitable for first-year engineers.
                </p>
              </div>
            ) : null}

            {/* TAB 1: EXPLAINER */}
            {!loading && activeTab === 'explain' && (
              <div className="space-y-4">
                {explainResult ? (
                  <>
                    {/* Summary */}
                    <div className="p-3.5 rounded-xl bg-brand-blue/10 border border-brand-blue/20 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-blue">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>High-Level Summary</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {explainResult.summary}
                      </p>
                    </div>

                    {/* Key Concepts Pills */}
                    {explainResult.concepts?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono font-semibold uppercase text-slate-400">
                          Concepts Practiced:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {explainResult.concepts.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[11px] bg-dark-800 border border-dark-700 text-brand-blue font-mono"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Line by line breakdown */}
                    {explainResult.lineByLine?.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono font-semibold uppercase text-slate-400">
                          Line-by-Line Breakdown:
                        </span>
                        <div className="space-y-2">
                          {explainResult.lineByLine.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-dark-900 border border-dark-700 space-y-1 text-xs"
                            >
                              <div className="flex items-center gap-2 font-mono text-[11px] text-brand-violet">
                                <span className="px-1.5 py-0.5 rounded bg-dark-750 text-slate-300">
                                  Line {item.line}
                                </span>
                                <code className="text-slate-300 truncate max-w-[200px]">{item.code}</code>
                              </div>
                              <p className="text-slate-300 text-xs leading-relaxed font-sans">{item.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : explainResult.rawExplanation ? (
                      <div className="p-3 rounded-lg bg-dark-900 border border-dark-700 text-xs text-slate-300 whitespace-pre-wrap font-sans">
                        {explainResult.rawExplanation}
                      </div>
                    ) : null}

                    {/* Related Example */}
                    {explainResult.relatedExample && (
                      <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-700 space-y-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          {explainResult.relatedExample.title || 'Related Concept'}
                        </span>
                        <pre className="p-2.5 rounded bg-dark-950 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                          {explainResult.relatedExample.code}
                        </pre>
                        <p className="text-xs text-slate-400">{explainResult.relatedExample.explanation}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <Code2 className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">No explanation generated yet</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Click the "Explain Code" button above to get a structured statement-by-statement breakdown of your code.
                    </p>
                    <button
                      onClick={handleExplain}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-indigo text-white hover:bg-brand-indigo/90 transition-colors"
                    >
                      Explain Current Code
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DEBUGGER */}
            {!loading && activeTab === 'debug' && (
              <div className="space-y-4">
                {/* Optional inputs */}
                <div className="space-y-2 p-3 rounded-xl bg-dark-900 border border-dark-700">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Observed Error or Warning (Optional):
                  </label>
                  <input
                    type="text"
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                    placeholder="e.g. IndexError: list index out of range"
                    className="w-full px-3 py-1.5 rounded-lg bg-dark-850 border border-dark-700 text-xs text-slate-200 focus:outline-none focus:border-brand-blue"
                  />
                  <label className="text-xs font-semibold text-slate-300 block pt-1">
                    Expected Behavior (Optional):
                  </label>
                  <input
                    type="text"
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    placeholder="e.g. Expected sum of elements to print 60"
                    className="w-full px-3 py-1.5 rounded-lg bg-dark-850 border border-dark-700 text-xs text-slate-200 focus:outline-none focus:border-brand-blue"
                  />
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={handleDebug}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors"
                    >
                      Analyze Issue
                    </button>
                  </div>
                </div>

                {debugResult && (
                  <div className="space-y-3">
                    {/* Bug summary */}
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Issue Identified</span>
                      </div>
                      <p className="text-xs text-slate-200">{debugResult.problemDescription}</p>
                    </div>

                    {/* Probable Cause */}
                    <div className="p-3 rounded-lg bg-dark-900 border border-dark-700 space-y-1">
                      <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
                        Probable Cause & Mechanism:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{debugResult.probableCause}</p>
                    </div>

                    {/* Correction */}
                    {debugResult.suggestedCorrection && (
                      <div className="p-3 rounded-lg bg-dark-900 border border-dark-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase">
                            Suggested Fix:
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(debugResult.suggestedCorrection);
                              toast.success('Fix copied to clipboard!');
                            }}
                            className="text-[11px] text-brand-blue hover:underline"
                          >
                            Copy Fix
                          </button>
                        </div>
                        <pre className="p-2.5 rounded bg-dark-950 font-mono text-xs text-emerald-300 overflow-x-auto">
                          {debugResult.suggestedCorrection}
                        </pre>
                        {debugResult.whyItWorks && (
                          <p className="text-xs text-slate-400 font-sans">{debugResult.whyItWorks}</p>
                        )}
                      </div>
                    )}

                    {/* Prevention Tip */}
                    {debugResult.preventionTip && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                        <span className="font-semibold text-amber-300 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5" />
                          Student Prevention Tip
                        </span>
                        <p className="text-slate-300">{debugResult.preventionTip}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: HINTS */}
            {!loading && activeTab === 'hints' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-700 space-y-2">
                  <span className="text-xs font-bold text-white">Select Socratic Hint Tier:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleRequestHint(lvl)}
                        className={`py-2 px-1 text-center rounded-lg text-xs font-semibold font-mono border transition-all ${
                          hintLevel === lvl && hintResult
                            ? 'bg-brand-violet text-white border-brand-violet'
                            : 'bg-dark-850 text-slate-300 border-dark-700 hover:border-brand-violet/50'
                        }`}
                      >
                        Level {lvl}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {HINT_LEVELS.find((h) => h.level === hintLevel)?.desc}
                  </p>
                </div>

                {hintResult ? (
                  <div className="p-4 rounded-xl bg-brand-violet/10 border border-brand-violet/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-violet">{hintResult.levelName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-violet/20 text-white">
                        Level {hintResult.level} / 4
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                      {hintResult.hint}
                    </p>
                    {hintResult.nextLevelAvailable && (
                      <button
                        onClick={() => handleRequestHint(hintResult.nextLevelAvailable)}
                        className="mt-2 text-xs font-semibold text-brand-blue hover:underline flex items-center gap-1"
                      >
                        Request Level {hintResult.nextLevelAvailable} Hint &rarr;
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500">
                    Click any hint level above to get a guided clue without spoiling the answer.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}


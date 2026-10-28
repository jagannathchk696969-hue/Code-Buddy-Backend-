import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Loader2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Code2,
  RotateCcw,
  Send,
  Eye,
  Trophy
} from 'lucide-react';
import CodeEditor from '../components/CodeEditor.jsx';
import {
  SUPPORTED_LANGUAGES,
  PRACTICE_TOPICS,
  DIFFICULTY_LEVELS,
  HINT_LEVELS
} from '../utils/constants.js';
import { aiApi, practiceApi } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Practice() {
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  // Generator selections
  const [selectedLang, setSelectedLang] = useState('python');
  const [selectedTopic, setSelectedTopic] = useState(PRACTICE_TOPICS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Beginner');
  const [generating, setGenerating] = useState(false);

  // Active problem
  const [problem, setProblem] = useState(null);
  const [studentCode, setStudentCode] = useState('');

  // Hints state
  const [unlockedHints, setUnlockedHints] = useState({});
  const [hintLoading, setHintLoading] = useState(false);
  const [solutionModalOpen, setSolutionModalOpen] = useState(false);
  const [solutionData, setSolutionData] = useState(null);
  const [solutionLoading, setSolutionLoading] = useState(false);

  // Attempt submission
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Generate new practice problem
  const handleGenerateProblem = async () => {
    setGenerating(true);
    setProblem(null);
    setUnlockedHints({});
    setSolutionData(null);
    setCompleted(false);

    try {
      const res = await aiApi.generatePractice(selectedLang, selectedTopic, selectedDifficulty);
      if (res.success && res.data) {
        setProblem(res.data);
        
        // Provide clean starter code in editor
        const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang);
        setStudentCode(
          selectedLang === 'python'
            ? `# Solve: ${res.data.title}\n\ndef solve():\n    # Write your solution here\n    pass\n`
            : selectedLang === 'c'
            ? `// Solve: ${res.data.title}\n#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`
            : selectedLang === 'cpp'
            ? `// Solve: ${res.data.title}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`
            : `// Solve: ${res.data.title}\nfunction solve() {\n    // Write your solution here\n}\n`
        );

        // Optionally persist problem to db if authenticated
        if (isAuthenticated) {
          try {
            await practiceApi.save(res.data);
          } catch (e) {
            // Non-blocking
          }
        }

        toast.success('Generated new practice challenge!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate problem.');
    } finally {
      setGenerating(false);
    }
  };

  // Request a progressive hint (Levels 1-4)
  const handleRequestHint = async (level) => {
    if (!problem) return;
    setHintLoading(true);
    try {
      const res = await aiApi.getHint(
        problem.language,
        problem.title,
        problem.description,
        level,
        studentCode
      );
      if (res.success && res.data) {
        setUnlockedHints((prev) => ({
          ...prev,
          [level]: res.data
        }));
        toast.info(`Unlocked ${res.data.levelName}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to get hint.');
    } finally {
      setHintLoading(false);
    }
  };

  // Unlock Level 5 Full Solution
  const handleUnlockSolution = async () => {
    if (!problem) return;
    setSolutionLoading(true);
    try {
      const res = await aiApi.getSolution(problem.language, problem.title, problem.description);
      if (res.success && res.data) {
        setSolutionData(res.data);
        setUnlockedHints((prev) => ({
          ...prev,
          5: res.data
        }));
        setSolutionModalOpen(false);
        toast.warning('Full reference solution unlocked.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load full solution.');
    } finally {
      setSolutionLoading(false);
    }
  };

  // Submit attempt
  const handleRecordAttempt = async () => {
    if (!problem) return;
    if (!studentCode.trim()) {
      toast.warning('Please write your code before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const highestHintUsed = Math.max(0, ...Object.keys(unlockedHints).map(Number));
      if (isAuthenticated) {
        await practiceApi.recordAttempt(problem.id || 'current-problem', {
          submittedCode: studentCode,
          hintsUsed: highestHintUsed,
          completed: true
        });
      }
      setCompleted(true);
      toast.success('Attempt saved! Well done on practicing.');
    } catch (err) {
      // Still celebrate local progress
      setCompleted(true);
      toast.success('Completed! Great job working through this challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-brand-violet text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Socratic Practice Arena</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Practice Challenges
          </h1>
          <p className="text-sm text-slate-400">
            Generate custom curriculum problems and develop logic with progressive hints.
          </p>
        </div>

        {/* Status Pill */}
        {problem && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-850 border border-dark-700 text-xs font-mono">
            <span className="text-slate-400">Hints used:</span>
            <span className="font-bold text-brand-violet">
              {Object.keys(unlockedHints).length} / 5
            </span>
          </div>
        )}
      </div>

      {/* Generator Control Bar */}
      <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Language selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Programming Language</label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-700 text-xs text-white focus:outline-none focus:border-brand-violet font-mono"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Curriculum Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-700 text-xs text-white focus:outline-none focus:border-brand-violet"
            >
              {PRACTICE_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-700 text-xs text-white focus:outline-none focus:border-brand-violet"
            >
              {DIFFICULTY_LEVELS.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateProblem}
              disabled={generating}
              className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-brand-violet to-brand-indigo hover:from-brand-violet/90 hover:to-brand-indigo/90 text-white shadow-glow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Challenge...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Problem</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Main Problem & Solution Workspace */}
      {problem ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Problem Statement & Hint Ladder (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Problem Card */}
            <div className="p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-brand-violet/20 text-brand-violet border border-brand-violet/30">
                  {problem.topic}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-dark-800 text-slate-300 border border-dark-700">
                  {problem.difficulty}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white">{problem.title}</h2>

              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {problem.description}
              </p>

              {/* Input / Output & Constraints */}
              <div className="space-y-3 pt-2 border-t border-dark-750 text-xs">
                {problem.inputDescription && (
                  <div>
                    <span className="font-mono text-slate-400 font-semibold uppercase text-[10px] block">
                      Input Format:
                    </span>
                    <p className="text-slate-300">{problem.inputDescription}</p>
                  </div>
                )}

                {problem.outputDescription && (
                  <div>
                    <span className="font-mono text-slate-400 font-semibold uppercase text-[10px] block">
                      Output Format:
                    </span>
                    <p className="text-slate-300">{problem.outputDescription}</p>
                  </div>
                )}

                {problem.constraints && (
                  <div>
                    <span className="font-mono text-slate-400 font-semibold uppercase text-[10px] block">
                      Constraints:
                    </span>
                    <p className="text-slate-300 font-mono">{problem.constraints}</p>
                  </div>
                )}

                {/* Sample Case */}
                {problem.sampleInput && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-dark-900 border border-dark-700">
                      <span className="text-[10px] font-mono text-slate-400 font-semibold block">
                        Sample Input:
                      </span>
                      <code className="text-xs text-emerald-400 font-mono block">
                        {problem.sampleInput}
                      </code>
                    </div>
                    <div className="p-2.5 rounded-lg bg-dark-900 border border-dark-700">
                      <span className="text-[10px] font-mono text-slate-400 font-semibold block">
                        Expected Output:
                      </span>
                      <code className="text-xs text-brand-blue font-mono block">
                        {problem.sampleOutput}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Socratic Hints Ladder */}
            <div className="p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-violet" />
                  Socratic Hint Ladder
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">Unlock as needed</span>
              </div>

              {/* Levels 1 - 4 */}
              <div className="space-y-2.5">
                {HINT_LEVELS.slice(0, 4).map((h) => {
                  const isUnlocked = Boolean(unlockedHints[h.level]);
                  return (
                    <div
                      key={h.level}
                      className={`p-3 rounded-xl border transition-all ${
                        isUnlocked
                          ? 'bg-brand-violet/10 border-brand-violet/40'
                          : 'bg-dark-900 border-dark-750'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded text-xs font-mono font-bold flex items-center justify-center ${
                              isUnlocked
                                ? 'bg-brand-violet text-white'
                                : 'bg-dark-800 text-slate-400'
                            }`}
                          >
                            L{h.level}
                          </span>
                          <span className="text-xs font-semibold text-white">{h.title}</span>
                        </div>

                        {!isUnlocked ? (
                          <button
                            onClick={() => handleRequestHint(h.level)}
                            disabled={hintLoading}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-dark-800 hover:bg-dark-750 text-brand-violet border border-brand-violet/30 transition-colors disabled:opacity-50"
                          >
                            Unlock
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Unlocked
                          </span>
                        )}
                      </div>

                      {/* Display Hint Content */}
                      {isUnlocked && (
                        <p className="mt-2 text-xs text-slate-200 leading-relaxed font-sans pt-2 border-t border-brand-violet/20 whitespace-pre-wrap">
                          {unlockedHints[h.level]?.hint}
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Level 5 Full Solution Button */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    unlockedHints[5]
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-dark-900 border-dark-750'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded bg-rose-500/20 text-rose-300 text-xs font-mono font-bold flex items-center justify-center">
                        L5
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Full Reference Solution
                        </span>
                        <span className="text-[10px] text-slate-400">Complete code & explanation</span>
                      </div>
                    </div>

                    {!unlockedHints[5] ? (
                      <button
                        onClick={() => setSolutionModalOpen(true)}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-colors"
                      >
                        Reveal Solution
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono font-semibold text-rose-400">Unlocked</span>
                    )}
                  </div>

                  {unlockedHints[5] && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-rose-500/20">
                      <pre className="p-3 rounded bg-dark-950 font-mono text-xs text-emerald-300 overflow-x-auto">
                        {unlockedHints[5].solutionCode}
                      </pre>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {unlockedHints[5].algorithmExplanation}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Code Editor & Submission (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            <CodeEditor
              language={problem.language}
              value={studentCode}
              onChange={setStudentCode}
              height="500px"
              title={`Your Solution (${problem.language.toUpperCase()})`}
            />

            {/* Bottom Actions */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-850 border border-dark-700">
              <div className="text-xs text-slate-400 font-mono">
                {completed ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    Problem Marked Completed!
                  </span>
                ) : (
                  <span>Ready to submit? Record your solution for analytics.</span>
                )}
              </div>

              <button
                onClick={handleRecordAttempt}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-sm transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{completed ? 'Update Submission' : 'Submit & Complete'}</span>
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-dark-850 border border-dark-700 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Problem Active</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Choose your language, preferred topic, and difficulty above, then click
            <strong className="text-white"> "Generate Problem"</strong> to begin your practice session.
          </p>
          <button
            onClick={handleGenerateProblem}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-brand-violet text-white hover:bg-brand-violet/90 transition-all shadow-glow-sm"
          >
            Generate Beginner {SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang)?.name} Problem
          </button>
        </div>
      )}

      {/* Confirmation Modal for Level 5 Full Solution */}
      {solutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full p-6 rounded-2xl bg-dark-850 border border-dark-700 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Unlock Full Reference Solution?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Working through challenges and wrestling with pseudocode produces 3x better cognitive retention. Are you sure you want to reveal the reference answer?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSolutionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-dark-750 transition-colors"
              >
                Keep Trying Myself
              </button>
              <button
                onClick={handleUnlockSolution}
                disabled={solutionLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-glow-sm transition-colors flex items-center gap-1.5"
              >
                {solutionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Yes, Reveal Solution</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


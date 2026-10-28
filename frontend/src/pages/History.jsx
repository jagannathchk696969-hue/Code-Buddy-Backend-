import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  BookOpen,
  Code2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
  Search
} from 'lucide-react';
import { practiceApi } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function History() {
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');

  useEffect(() => {
    async function fetchHistory() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const res = await practiceApi.listAttempts();
        if (res.success && res.data) {
          setAttempts(res.data);
        }
      } catch (err) {
        console.warn('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [isAuthenticated]);

  const handleCopyCode = async (id, code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Code copied to clipboard!');
    } catch (e) {
      toast.error('Failed to copy code.');
    }
  };

  const filteredAttempts = attempts.filter((att) => {
    const titleMatch = (att.practice_problems?.title || '').toLowerCase().includes(search.toLowerCase());
    const topicMatch = (att.practice_problems?.topic || '').toLowerCase().includes(search.toLowerCase());
    const langMatch =
      selectedLang === 'all' ||
      (att.practice_problems?.language || '').toLowerCase() === selectedLang.toLowerCase();

    return (titleMatch || topicMatch) && langMatch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-brand-violet text-xs font-semibold">
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>Learning Archive</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Practice & Submission History
          </h1>
          <p className="text-sm text-slate-400">
            Review past problem solutions, hint usage records, and progress over time.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-dark-850 border border-dark-700">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems or topics..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-dark-900 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
          />
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['all', 'python', 'c', 'cpp', 'javascript'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-semibold transition-all ${
                selectedLang === lang
                  ? 'bg-brand-violet text-white'
                  : 'bg-dark-800 text-slate-400 hover:text-white border border-dark-750'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-brand-blue animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading past records...</p>
        </div>
      ) : filteredAttempts.length > 0 ? (
        <div className="space-y-3">
          {filteredAttempts.map((att) => {
            const isExpanded = expandedId === att.id;
            const prob = att.practice_problems;
            return (
              <div
                key={att.id}
                className="rounded-2xl bg-dark-850 border border-dark-700 overflow-hidden transition-all shadow-md"
              >
                {/* Summary Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : att.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-dark-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-indigo/15 border border-brand-indigo/30 flex items-center justify-center text-brand-blue shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">
                        {prob?.title || 'Practice Challenge'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                        <span className="capitalize text-brand-blue font-semibold">
                          {prob?.language || 'Language'}
                        </span>
                        <span>•</span>
                        <span>{prob?.topic || 'Topic'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          {new Date(att.updated_at || att.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded bg-dark-800 border border-dark-700 text-slate-300 font-mono text-xs">
                      {att.hints_used || 0} Hints Used
                    </span>
                    <span className="px-2.5 py-1 rounded text-xs font-semibold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Completed
                    </span>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Code Body */}
                {isExpanded && (
                  <div className="p-5 border-t border-dark-700 bg-dark-900 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-400 font-semibold uppercase">
                        Submitted Solution Code:
                      </span>
                      <button
                        onClick={() => handleCopyCode(att.id, att.submitted_code)}
                        className="flex items-center gap-1.5 text-brand-blue hover:underline font-mono"
                      >
                        {copiedId === att.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-dark-950 font-mono text-xs text-emerald-300 overflow-x-auto border border-dark-750">
                      {att.submitted_code || '// No code recorded'}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-dark-850 border border-dark-700 space-y-2">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No submission records found</h3>
          <p className="text-xs text-slate-500">
            {search ? 'Try clearing your search term.' : 'Complete practice problems to see your code history here.'}
          </p>
        </div>
      )}

    </div>
  );
}


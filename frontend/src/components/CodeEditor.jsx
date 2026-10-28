import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, RotateCcw, Trash2, Check, Code2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/constants.js';

export default function CodeEditor({
  language = 'python',
  value = '',
  onChange,
  height = '420px',
  readOnly = false,
  title = null,
  onResetStarter = null
}) {
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef(null);

  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === language) || SUPPORTED_LANGUAGES[0];
  const monacoLang = langConfig.monacoLang || 'python';

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleClear = () => {
    if (onChange && !readOnly) {
      onChange('');
    }
  };

  const handleReset = () => {
    if (onResetStarter) {
      onResetStarter();
    } else if (onChange && langConfig.starter) {
      onChange(langConfig.starter);
    }
  };

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-dark-700 bg-dark-900 shadow-xl transition-all">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-850 border-b border-dark-700">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-brand-blue" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            {title || langConfig.name}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-dark-750 text-slate-400 font-mono">
            {langConfig.extension}
          </span>
          {readOnly && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Read Only
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg text-slate-400 hover:text-white hover:bg-dark-750 transition-colors"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {!readOnly && (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg text-slate-400 hover:text-white hover:bg-dark-750 transition-colors"
                title="Reset to Starter Template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Starter</span>
              </button>

              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                title="Clear Editor"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="relative w-full" style={{ height }}>
        <Editor
          height="100%"
          language={monacoLang}
          value={value}
          onChange={(val) => onChange && onChange(val || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            readOnly,
            fontSize: 13.5,
            lineHeight: 22,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'line',
            contextmenu: true
          }}
          loading={
            <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs">
              Loading Monaco Editor...
            </div>
          }
        />
      </div>
    </div>
  );
}


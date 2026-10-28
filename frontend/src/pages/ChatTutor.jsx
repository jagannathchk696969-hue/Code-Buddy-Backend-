import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Code2,
  Sparkles,
  Loader2,
  User,
  Bot,
  Copy,
  Check,
  Lightbulb,
  Terminal
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/constants.js';
import { aiApi, conversationApi } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ChatTutor() {
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const [language, setLanguage] = useState('python');
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your Socratic AI Programming Tutor. 

I'm here to guide your thinking across **Python, C, C++, and JavaScript**. If you have questions about loops, functions, memory, or logic, ask away!

What are you working on today?`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachedCode, setAttachedCode] = useState('');
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load user conversations if available
  const loadConversations = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await conversationApi.list();
      if (res.success && res.data) {
        setConversations(res.data);
      }
    } catch (e) {
      // Offline fallback
    }
  };

  useEffect(() => {
    loadConversations();
  }, [isAuthenticated]);

  // Switch or load conversation
  const handleSelectConversation = async (conv) => {
    setActiveConvId(conv.id);
    setLanguage(conv.language || 'python');
    try {
      const res = await conversationApi.get(conv.id);
      if (res.success && res.data) {
        if (res.data.messages && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        }
      }
    } catch (e) {
      // Use local list
    }
  };

  // Start fresh conversation
  const handleNewConversation = async () => {
    setActiveConvId(null);
    setMessages([
      {
        id: 'new-welcome',
        role: 'assistant',
        content: `Started a new conversation in **${SUPPORTED_LANGUAGES.find((l) => l.id === language)?.name}**. How can I help you understand code today?`
      }
    ]);
    setAttachedCode('');
    setShowCodeBox(false);
  };

  // Delete conversation
  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      await conversationApi.delete(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        handleNewConversation();
      }
      toast.info('Conversation deleted.');
    } catch (e) {
      toast.error('Could not delete conversation.');
    }
  };

  // Send message
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() && !attachedCode.trim()) return;

    let fullMessage = inputMessage.trim();
    if (attachedCode.trim()) {
      fullMessage += `\n\n\`\`\`${language}\n${attachedCode.trim()}\n\`\`\``;
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: fullMessage
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setAttachedCode('');
    setShowCodeBox(false);
    setSending(true);

    try {
      // Format history
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await aiApi.chat(language, fullMessage, history, activeConvId);
      if (res.success && res.data) {
        const botMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.message
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      toast.error(err.message || 'Tutor response failed.');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I ran into an issue connecting to the AI provider. Please make sure the AI service is active and retry.'
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Top Bar: Language & Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-indigo/15 border border-brand-indigo/30 flex items-center justify-center text-brand-blue">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Socratic AI Tutor
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-violet/20 text-brand-violet border border-brand-violet/30">
                Gemma 3 / Gemini
              </span>
            </h1>
            <p className="text-xs text-slate-400">Guiding reasoning step by step without spoiling solutions</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-dark-850 p-1 rounded-xl border border-dark-700">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                language === l.id
                  ? 'bg-brand-indigo text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Layout: Sidebar + Messages (Split) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 min-h-0">
        
        {/* Left Sidebar: Conversations (3 cols) */}
        <div className="hidden md:flex flex-col md:col-span-3 rounded-2xl bg-dark-850 border border-dark-700 p-3 space-y-3 overflow-hidden">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-brand-blue" />
            <span>New Chat Session</span>
          </button>

          <span className="text-[11px] font-mono font-semibold uppercase text-slate-500 px-2 pt-1">
            Recent Conversations
          </span>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {conversations.length > 0 ? (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    activeConvId === c.id
                      ? 'bg-brand-indigo/15 border border-brand-indigo/30 text-white font-medium'
                      : 'hover:bg-dark-800 text-slate-300'
                  }`}
                >
                  <div className="truncate flex-1 pr-2">
                    <p className="truncate">{c.title || 'Untitled Session'}</p>
                    <span className="text-[10px] text-slate-500 font-mono capitalize">
                      {c.language || 'Code'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 p-2 text-center">No saved chats yet.</p>
            )}
          </div>
        </div>

        {/* Right Main Window: Messages List & Input (9 cols) */}
        <div className="col-span-1 md:col-span-9 flex flex-col rounded-2xl bg-dark-850 border border-dark-700 overflow-hidden">
          
          {/* Scrollable Message Flow */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-blue flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isBot
                        ? 'bg-dark-900 border border-dark-700 text-slate-200'
                        : 'bg-brand-indigo text-white shadow-glow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  </div>

                  {!isBot && (
                    <div className="w-8 h-8 rounded-xl bg-dark-750 border border-dark-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {sending && (
              <div className="flex items-center gap-3 text-xs text-slate-400 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-dark-800 flex items-center justify-center text-brand-blue">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <span>Tutor is considering your question...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Optional Code Attachment Box */}
          {showCodeBox && (
            <div className="px-4 py-2 border-t border-dark-700 bg-dark-900 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Attach Code Snippet ({language})</span>
                <button
                  onClick={() => setShowCodeBox(false)}
                  className="text-slate-500 hover:text-white"
                >
                  Close
                </button>
              </div>
              <textarea
                rows={4}
                value={attachedCode}
                onChange={(e) => setAttachedCode(e.target.value)}
                placeholder="Paste code here to discuss with the tutor..."
                className="w-full p-2.5 rounded-lg bg-dark-950 border border-dark-700 text-xs font-mono text-emerald-300 focus:outline-none focus:border-brand-blue"
              />
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-dark-900 border-t border-dark-700">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCodeBox(!showCodeBox)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  showCodeBox || attachedCode
                    ? 'bg-brand-blue/20 border-brand-blue/40 text-brand-blue'
                    : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-white'
                }`}
                title="Attach Code Snippet"
              >
                <Code2 className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask a question about ${SUPPORTED_LANGUAGES.find((l) => l.id === language)?.name} or programming logic...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-indigo"
              />

              <button
                type="submit"
                disabled={sending || (!inputMessage.trim() && !attachedCode.trim())}
                className="p-2.5 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-glow-sm transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}


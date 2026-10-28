import React, { useState } from 'react';
import { User, Shield, Cpu, Sparkles, Check, Loader2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import ProviderBadge from '../components/ProviderBadge.jsx';

export default function Profile() {
  const { user, updateDisplayName, isCloudAuth } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateDisplayName(name.trim());
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Profile & System Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your student profile, account identity, and active AI engine connection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Details Card (2 cols) */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-blue flex items-center justify-center text-white text-2xl font-bold shadow-glow-sm">
              {user?.displayName?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.displayName || 'Student'}</h2>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-brand-indigo/15 text-brand-blue border border-brand-indigo/30">
                {isCloudAuth ? 'Supabase Authenticated' : 'Local Demo Profile'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-dark-700">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-dark-700 text-xs text-white focus:outline-none focus:border-brand-indigo"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || 'student@codebuddy.ai'}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-dark-750 text-xs text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-glow-sm transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          </form>
        </div>

        {/* AI Provider Telemetry Card (1 col) */}
        <div className="p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-blue" />
              Active AI Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              CodeBuddy AI runs on your choice of local Gemma 3 (via Ollama) or Google Gemini in the cloud.
            </p>

            <div className="pt-2">
              <ProviderBadge />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-dark-900 border border-dark-750 text-xs text-slate-400 space-y-1.5">
            <span className="font-mono text-[10px] text-slate-500 uppercase block font-semibold">
              Security Guarantee:
            </span>
            <p className="text-[11px] leading-relaxed">
              Student code is analyzed pedagogically; code is never executed via untrusted child processes on the server.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}


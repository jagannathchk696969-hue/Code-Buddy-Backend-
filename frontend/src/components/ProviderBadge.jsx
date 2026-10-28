import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { healthApi } from '../services/api.js';

export default function ProviderBadge() {
  const [providerInfo, setProviderInfo] = useState({
    provider: 'ollama',
    model: 'gemma3:1b',
    status: 'checking',
    latencyMs: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await healthApi.checkAi();
      if (res.success && res.data) {
        setProviderInfo({
          provider: res.data.provider || 'ollama',
          model: res.data.model || 'gemma3:1b',
          status: res.data.status || 'connected',
          latencyMs: res.data.latencyMs || 0
        });
      } else {
        setProviderInfo(prev => ({
          ...prev,
          status: 'error',
          error: res.data?.error || 'Provider unavailable'
        }));
      }
    } catch (err) {
      setProviderInfo(prev => ({
        ...prev,
        status: 'error',
        error: err.message
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Poll health status every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = providerInfo.status === 'connected';
  const isOllama = providerInfo.provider === 'ollama';

  return (
    <div
      title={isConnected ? `AI Connected (${providerInfo.latencyMs}ms latency)` : providerInfo.error || 'AI Provider Disconnected'}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-dark-800/80 backdrop-blur border-dark-700 shadow-sm transition-all"
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isConnected ? 'bg-emerald-400' : 'bg-rose-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />
      </span>

      <div className="flex items-center gap-1.5 text-slate-300">
        {isOllama ? (
          <Cpu className="w-3.5 h-3.5 text-brand-blue" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
        )}
        <span className="font-semibold capitalize text-white">{providerInfo.provider}</span>
        <span className="text-dark-600">|</span>
        <span className="font-mono text-slate-400">{providerInfo.model}</span>
      </div>

      <button
        onClick={fetchHealth}
        disabled={loading}
        className="text-slate-500 hover:text-white transition-colors ml-0.5"
        title="Refresh AI health status"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-brand-blue' : ''}`} />
      </button>
    </div>
  );
}

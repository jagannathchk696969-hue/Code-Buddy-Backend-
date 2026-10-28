import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, UserPlus, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { register, loginAsDemo } = useAuth();
  const toast = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password, displayName);
      toast.success('Account created! Welcome to CodeBuddy.');
      navigate('/workspace');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await loginAsDemo();
      toast.success('Signed in as Demo Student!');
      navigate('/workspace');
    } catch (err) {
      toast.error('Failed to start demo session.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full p-8 rounded-3xl bg-dark-850 border border-dark-700 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-indigo via-brand-violet to-brand-blue flex items-center justify-center text-white mx-auto shadow-glow-sm">
            <Code2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Your Account</h2>
          <p className="text-xs text-slate-400">
            Start mastering Python, C, C++, and JavaScript with AI guidance.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Chen"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-indigo"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-indigo"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-indigo"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-brand-indigo to-brand-violet hover:from-brand-indigo/90 hover:to-brand-violet/90 text-white shadow-glow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>Sign Up</span>
          </button>
        </form>

        <div className="relative border-t border-dark-700 my-4">
          <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 px-2 text-[10px] font-mono uppercase bg-dark-850 text-slate-500">
            or skip signup
          </span>
        </div>

        {/* Demo Login Button */}
        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="w-full py-2.5 rounded-xl text-xs font-semibold bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          {demoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
          ) : (
            <Sparkles className="w-4 h-4 text-brand-blue" />
          )}
          <span>Explore in Demo Mode</span>
        </button>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-blue hover:underline font-semibold">
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
}


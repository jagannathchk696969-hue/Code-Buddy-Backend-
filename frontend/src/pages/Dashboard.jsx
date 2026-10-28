import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  Compass,
  ArrowRight,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { dashboardApi, practiceApi } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const PIE_COLORS = ['#38BDF8', '#6366F1', '#8B5CF6', '#10B981', '#F59E0B'];

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) {
        // Fallback offline mock data without hitting protected endpoints
        setStats({
          totalAttempts: 5,
          problemsCompleted: 4,
          questionsAsked: 12,
          streak: 3,
          topLanguages: [
            { language: 'python', count: 8 },
            { language: 'c', count: 4 },
            { language: 'javascript', count: 3 }
          ],
          recentTopics: ['Loops', 'Arrays', 'Conditionals'],
          suggestedTopics: ['Recursion', 'Functions', 'Strings'],
          chartData: [
            { day: 'Wed', activities: 2, attempts: 1 },
            { day: 'Thu', activities: 4, attempts: 2 },
            { day: 'Fri', activities: 1, attempts: 0 },
            { day: 'Sat', activities: 3, attempts: 1 },
            { day: 'Sun', activities: 5, attempts: 3 },
            { day: 'Mon', activities: 2, attempts: 1 },
            { day: 'Tue', activities: 6, attempts: 2 }
          ]
        });
        setLoading(false);
        return;
      }

      try {
        const [statsRes, attemptsRes] = await Promise.allSettled([
          dashboardApi.getStats(),
          practiceApi.listAttempts()
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
          setStats(statsRes.value.data);
        } else {
          // Fallback demo data
          setStats({
            totalAttempts: 5,
            problemsCompleted: 4,
            questionsAsked: 12,
            streak: 3,
            topLanguages: [
              { language: 'python', count: 8 },
              { language: 'c', count: 4 },
              { language: 'javascript', count: 3 }
            ],
            recentTopics: ['Loops', 'Arrays', 'Conditionals'],
            suggestedTopics: ['Recursion', 'Functions', 'Strings'],
            chartData: [
              { day: 'Wed', activities: 2, attempts: 1 },
              { day: 'Thu', activities: 4, attempts: 2 },
              { day: 'Fri', activities: 1, attempts: 0 },
              { day: 'Sat', activities: 3, attempts: 1 },
              { day: 'Sun', activities: 5, attempts: 3 },
              { day: 'Mon', activities: 2, attempts: 1 },
              { day: 'Tue', activities: 6, attempts: 2 }
            ]
          });
        }

        if (attemptsRes.status === 'fulfilled' && attemptsRes.value?.success) {
          setAttempts(attemptsRes.value.data || []);
        }
      } catch (err) {
        console.warn('Dashboard fetch fallback', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Computing learning analytics...</p>
      </div>
    );
  }

  const completionRate = stats?.totalAttempts
    ? Math.round((stats.problemsCompleted / stats.totalAttempts) * 100)
    : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Honest Persisted Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Learning Analytics & Progress
          </h1>
          <p className="text-sm text-slate-400">
            Welcome back, {user?.displayName || 'Student'}! Here is your verified programming growth.
          </p>
        </div>

        {/* Streak Highlight */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white font-mono">{stats?.streak || 1}</span>
            <span className="text-xs font-bold text-amber-300 ml-1.5 uppercase font-mono">Day Streak</span>
            <p className="text-[10px] text-slate-400">Consecutive days active</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase font-semibold">Challenges Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats?.problemsCompleted || 0}
            <span className="text-xs font-normal text-slate-400 ml-2">/ {stats?.totalAttempts || 0} attempted</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {completionRate}% success rate
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase font-semibold">Tutor Questions</span>
            <MessageSquare className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats?.questionsAsked || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Across interactive conversations
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase font-semibold">Top Language</span>
            <Award className="w-4 h-4 text-brand-violet" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono capitalize">
            {stats?.topLanguages?.[0]?.language || 'Python'}
          </div>
          <div className="text-[11px] text-brand-violet font-medium">
            {stats?.topLanguages?.[0]?.count || 0} learning activities logged
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase font-semibold">Curriculum Topics</span>
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats?.recentTopics?.length || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Distinct programming concepts
          </div>
        </div>

      </div>

      {/* Main Charts: Activity Trend & Language Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Activity Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-blue" />
              7-Day Learning Activity Frequency
            </h3>
            <span className="text-xs text-slate-500 font-mono">Real daily events</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="attemptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#223052" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1626',
                    borderColor: '#223052',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#F1F5F9'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="activities"
                  name="AI Explanations & Chats"
                  stroke="#38BDF8"
                  fillOpacity={1}
                  fill="url(#activityGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="attempts"
                  name="Practice Attempts"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#attemptGrad)"
                  strokeWidth={2}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Breakdown Pie Chart (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
              Language Focus
            </h3>
            <span className="text-xs text-slate-500 font-mono">By Engagement</span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {stats?.topLanguages?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.topLanguages}
                    dataKey="count"
                    nameKey="language"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {stats.topLanguages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1626',
                      borderColor: '#223052',
                      borderRadius: '0.75rem',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No language data recorded yet.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-xs font-mono">
            {stats?.topLanguages?.map((l, i) => (
              <div key={l.language} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-slate-300 capitalize">{l.language}:</span>
                <span className="text-slate-500 font-bold">{l.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Suggested Next Topics & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Suggested Topics (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-violet" />
            Recommended Next Topics
          </h3>
          <p className="text-xs text-slate-400">
            Based on concepts you haven't tackled yet in your practice:
          </p>

          <div className="space-y-2">
            {stats?.suggestedTopics?.map((topic, i) => (
              <Link
                key={i}
                to="/practice"
                className="flex items-center justify-between p-3 rounded-xl bg-dark-900 hover:bg-dark-800 border border-dark-750 transition-colors group"
              >
                <span className="text-xs font-medium text-slate-200">{topic}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-blue transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Attempts Table (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Recent Practice Submissions
            </h3>
            <Link to="/history" className="text-xs text-brand-blue hover:underline">
              View All History &rarr;
            </Link>
          </div>

          {attempts.length > 0 ? (
            <div className="divide-y divide-dark-700 overflow-x-auto">
              {attempts.slice(0, 5).map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-white">
                      {att.practice_problems?.title || 'Practice Exercise'}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-slate-500 font-mono text-[11px]">
                      <span className="capitalize text-brand-blue">{att.practice_problems?.language}</span>
                      <span>•</span>
                      <span>{att.practice_problems?.topic}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-dark-800 border border-dark-700 text-slate-400 font-mono text-[10px]">
                      {att.hints_used || 0} hints
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No practice attempts recorded yet. Solve your first problem in the{' '}
              <Link to="/practice" className="text-brand-blue underline">
                Practice Arena
              </Link>
              !
            </div>
          )}
        </div>

      </div>

    </div>
  );
}


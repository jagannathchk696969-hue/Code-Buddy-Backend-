import { getSupabase, isSupabaseReady, mockDb } from '../services/supabase/supabaseClient.js';

const ALL_CURATED_TOPICS = [
  'Variables and data types',
  'Operators',
  'Conditional statements',
  'Loops',
  'Arrays',
  'Strings',
  'Functions',
  'Recursion',
  'Searching and sorting',
  'Object-oriented programming',
  'Basic data structures'
];

/**
 * Calculates real student statistics from persisted database records.
 */
export async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    let attempts = [];
    let activities = [];
    let questionsAsked = 0;

    if (isSupabaseReady()) {
      const supabase = getSupabase();

      // 1. Fetch practice attempts
      const { data: attemptsData } = await supabase
        .from('practice_attempts')
        .select('*, practice_problems(language, topic)')
        .eq('user_id', userId);
      attempts = attemptsData || [];

      // 2. Fetch recent learning activities
      const { data: actData } = await supabase
        .from('learning_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      activities = actData || [];

      // 3. Questions asked count (user messages in user conversations)
      const { count } = await supabase
        .from('conversation_messages')
        .select('id, conversations!inner(user_id)', { count: 'exact', head: true })
        .eq('role', 'user')
        .eq('conversations.user_id', userId);
      questionsAsked = count || 0;
    } else {
      attempts = Array.from(mockDb.practiceAttempts.values())
        .filter(a => a.user_id === userId)
        .map(a => ({
          ...a,
          practice_problems: mockDb.practiceProblems.get(a.problem_id) || null
        }));

      activities = Array.from(mockDb.learningActivity.values())
        .filter(a => a.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Count user messages in mock conversations
      const userConvs = new Set(
        Array.from(mockDb.conversations.values())
          .filter(c => c.user_id === userId)
          .map(c => c.id)
      );

      questionsAsked = Array.from(mockDb.conversationMessages.values()).filter(
        m => m.role === 'user' && userConvs.has(m.conversation_id)
      ).length;
    }

    // Compute metrics
    const totalAttempts = attempts.length;
    const problemsCompleted = attempts.filter(a => a.completed).length;

    // Language frequency count
    const langCounts = {};
    attempts.forEach(a => {
      const lang = a.practice_problems?.language;
      if (lang) {
        langCounts[lang] = (langCounts[lang] || 0) + 1;
      }
    });
    activities.forEach(act => {
      if (act.language) {
        langCounts[act.language] = (langCounts[act.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(langCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);

    // Recently studied topics
    const studiedTopicsSet = new Set();
    const recentTopics = [];
    activities.forEach(act => {
      if (act.topic && !studiedTopicsSet.has(act.topic)) {
        studiedTopicsSet.add(act.topic);
        recentTopics.push(act.topic);
      }
    });
    attempts.forEach(a => {
      const t = a.practice_problems?.topic;
      if (t && !studiedTopicsSet.has(t)) {
        studiedTopicsSet.add(t);
        recentTopics.push(t);
      }
    });

    // Suggested next topics (topics not yet practiced)
    const suggestedTopics = ALL_CURATED_TOPICS.filter(t => !studiedTopicsSet.has(t)).slice(0, 4);
    if (suggestedTopics.length === 0) {
      suggestedTopics.push('Searching and sorting', 'Recursion', 'Basic data structures');
    }

    // Learning streak calculation (consecutive calendar days)
    const activeDates = new Set();
    activities.forEach(a => {
      activeDates.add(new Date(a.created_at).toISOString().split('T')[0]);
    });
    attempts.forEach(a => {
      activeDates.add(new Date(a.created_at).toISOString().split('T')[0]);
    });

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activeDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has no activity yet, check yesterday before ending streak
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (activeDates.has(yesterdayStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    // Activity trend for chart (past 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayActivityCount = activities.filter(a => a.created_at.startsWith(dayStr)).length;
      const dayAttemptsCount = attempts.filter(a => a.created_at.startsWith(dayStr)).length;

      chartData.push({
        day: label,
        activities: dayActivityCount,
        attempts: dayAttemptsCount,
        date: dayStr
      });
    }

    res.json({
      success: true,
      data: {
        totalAttempts,
        problemsCompleted,
        questionsAsked,
        topLanguages,
        recentTopics: recentTopics.slice(0, 6),
        suggestedTopics,
        streak,
        chartData
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Returns user learning activity stream.
 */
export async function getDashboardActivity(req, res, next) {
  try {
    const userId = req.user.id;

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('learning_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return res.json({ success: true, data });
    }

    const acts = Array.from(mockDb.learningActivity.values())
      .filter(a => a.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20);

    res.json({ success: true, data: acts });
  } catch (err) {
    next(err);
  }
}

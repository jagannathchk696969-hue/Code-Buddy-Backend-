import { getSupabase, isSupabaseReady, mockDb } from '../services/supabase/supabaseClient.js';
import { saveProblemSchema, saveAttemptSchema } from '../validators/practiceValidator.js';
import crypto from 'crypto';

export async function listProblems(req, res, next) {
  try {
    const userId = req.user.id;

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('practice_problems')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data });
    }

    const problems = Array.from(mockDb.practiceProblems.values())
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: problems });
  } catch (err) {
    next(err);
  }
}

export async function saveProblem(req, res, next) {
  try {
    const userId = req.user.id;
    const validated = saveProblemSchema.parse(req.body);

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('practice_problems')
        .insert({
          user_id: userId,
          language: validated.language,
          topic: validated.topic,
          difficulty: validated.difficulty,
          title: validated.title,
          description: validated.description,
          input_description: validated.inputDescription,
          output_description: validated.outputDescription,
          constraints: validated.constraints,
          sample_input: validated.sampleInput,
          sample_output: validated.sampleOutput,
          concept_practiced: validated.conceptPracticed
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    const id = crypto.randomUUID();
    const problem = {
      id,
      user_id: userId,
      language: validated.language,
      topic: validated.topic,
      difficulty: validated.difficulty,
      title: validated.title,
      description: validated.description,
      input_description: validated.inputDescription,
      output_description: validated.outputDescription,
      constraints: validated.constraints,
      sample_input: validated.sampleInput,
      sample_output: validated.sampleOutput,
      concept_practiced: validated.conceptPracticed,
      created_at: new Date().toISOString()
    };
    mockDb.practiceProblems.set(id, problem);

    res.status(201).json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
}

export async function getProblem(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('practice_problems')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Practice problem not found or unauthorized' }
        });
      }
      return res.json({ success: true, data });
    }

    const problem = mockDb.practiceProblems.get(id);
    if (!problem || problem.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Practice problem not found or unauthorized' }
      });
    }

    res.json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
}

export async function recordAttempt(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: problemId } = req.params;
    const validated = saveAttemptSchema.parse(req.body);

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      // Check if attempt exists for this user and problem
      const { data: existing } = await supabase
        .from('practice_attempts')
        .select('id, hints_used')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .maybeSingle();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('practice_attempts')
          .update({
            submitted_code: validated.submittedCode,
            hints_used: Math.max(existing.hints_used || 0, validated.hintsUsed),
            completed: validated.completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('practice_attempts')
          .insert({
            user_id: userId,
            problem_id: problemId,
            submitted_code: validated.submittedCode,
            hints_used: validated.hintsUsed,
            completed: validated.completed
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return res.json({ success: true, data: result });
    }

    // In-memory fallback
    const existing = Array.from(mockDb.practiceAttempts.values()).find(
      a => a.user_id === userId && a.problem_id === problemId
    );

    if (existing) {
      existing.submitted_code = validated.submittedCode;
      existing.hints_used = Math.max(existing.hints_used || 0, validated.hintsUsed);
      existing.completed = validated.completed;
      existing.updated_at = new Date().toISOString();
      mockDb.practiceAttempts.set(existing.id, existing);
      return res.json({ success: true, data: existing });
    }

    const id = crypto.randomUUID();
    const newAttempt = {
      id,
      user_id: userId,
      problem_id: problemId,
      submitted_code: validated.submittedCode,
      hints_used: validated.hintsUsed,
      completed: validated.completed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockDb.practiceAttempts.set(id, newAttempt);

    res.json({ success: true, data: newAttempt });
  } catch (err) {
    next(err);
  }
}

export async function listAttempts(req, res, next) {
  try {
    const userId = req.user.id;

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('practice_attempts')
        .select('*, practice_problems(title, language, difficulty, topic)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data });
    }

    const attempts = Array.from(mockDb.practiceAttempts.values())
      .filter(a => a.user_id === userId)
      .map(a => {
        const prob = mockDb.practiceProblems.get(a.problem_id);
        return {
          ...a,
          practice_problems: prob ? {
            title: prob.title,
            language: prob.language,
            difficulty: prob.difficulty,
            topic: prob.topic
          } : null
        };
      })
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    res.json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
}

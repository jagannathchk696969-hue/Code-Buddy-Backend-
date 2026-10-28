import { aiService } from '../services/ai/aiService.js';
import {
  explainSchema,
  debugSchema,
  practiceGenerateSchema,
  hintRequestSchema,
  solutionRequestSchema,
  chatSchema
} from '../validators/aiValidator.js';
import { getSupabase, isSupabaseReady, mockDb } from '../services/supabase/supabaseClient.js';
import crypto from 'crypto';

/**
 * Helper to record learning activity asynchronously without blocking the AI response.
 */
async function logActivity(userId, activityType, language, topic = null, metadata = {}) {
  if (!userId) return;

  try {
    if (isSupabaseReady()) {
      const supabase = getSupabase();
      await supabase.from('learning_activity').insert({
        user_id: userId,
        activity_type: activityType,
        language,
        topic,
        metadata
      });
    } else {
      const id = crypto.randomUUID();
      mockDb.learningActivity.set(id, {
        id,
        user_id: userId,
        activity_type: activityType,
        language,
        topic,
        metadata,
        created_at: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('[ACTIVITY] Could not record activity:', err.message);
  }
}

export async function explainCode(req, res, next) {
  try {
    const validated = explainSchema.parse(req.body);
    const result = await aiService.explainCode(validated.language, validated.code);

    if (req.user?.id) {
      logActivity(req.user.id, 'explain_code', validated.language, null, {
        summarySnippet: result.summary?.slice(0, 100)
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function debugCode(req, res, next) {
  try {
    const validated = debugSchema.parse(req.body);
    const result = await aiService.debugCode(
      validated.language,
      validated.code,
      validated.errorMessage,
      validated.expectedBehavior
    );

    if (req.user?.id) {
      logActivity(req.user.id, 'debug_code', validated.language, null, {
        isCertain: result.isCertain
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function generatePractice(req, res, next) {
  try {
    const validated = practiceGenerateSchema.parse(req.body);
    const result = await aiService.generatePracticeProblem(
      validated.language,
      validated.topic,
      validated.difficulty
    );

    if (req.user?.id) {
      logActivity(req.user.id, 'generate_practice', validated.language, validated.topic, {
        difficulty: validated.difficulty,
        title: result.title
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function getHint(req, res, next) {
  try {
    const validated = hintRequestSchema.parse(req.body);
    const result = await aiService.getHint(
      validated.language,
      validated.problemTitle,
      validated.problemDescription,
      validated.requestedLevel,
      validated.studentCode
    );

    if (req.user?.id) {
      logActivity(req.user.id, 'hint_requested', validated.language, null, {
        level: validated.requestedLevel,
        title: validated.problemTitle
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function getSolution(req, res, next) {
  try {
    const validated = solutionRequestSchema.parse(req.body);
    const result = await aiService.getSolution(
      validated.language,
      validated.problemTitle,
      validated.problemDescription
    );

    if (req.user?.id) {
      logActivity(req.user.id, 'solution_viewed', validated.language, null, {
        title: validated.problemTitle
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function chatTutor(req, res, next) {
  try {
    const validated = chatSchema.parse(req.body);
    const result = await aiService.chatTutor(
      validated.language,
      validated.message,
      validated.history
    );

    // If conversation ID is present and user is authenticated, save messages
    if (validated.conversationId && req.user?.id) {
      if (isSupabaseReady()) {
        const supabase = getSupabase();
        await supabase.from('conversation_messages').insert([
          {
            conversation_id: validated.conversationId,
            role: 'user',
            content: validated.message
          },
          {
            conversation_id: validated.conversationId,
            role: 'assistant',
            content: result.message
          }
        ]);
      } else {
        const userMsgId = crypto.randomUUID();
        const asstMsgId = crypto.randomUUID();
        mockDb.conversationMessages.set(userMsgId, {
          id: userMsgId,
          conversation_id: validated.conversationId,
          role: 'user',
          content: validated.message,
          created_at: new Date().toISOString()
        });
        mockDb.conversationMessages.set(asstMsgId, {
          id: asstMsgId,
          conversation_id: validated.conversationId,
          role: 'assistant',
          content: result.message,
          created_at: new Date().toISOString()
        });
      }

      logActivity(req.user.id, 'chat_message', validated.language, null, {
        conversationId: validated.conversationId
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

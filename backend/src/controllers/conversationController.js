import { getSupabase, isSupabaseReady, mockDb } from '../services/supabase/supabaseClient.js';
import { createConversationSchema, updateConversationSchema } from '../validators/conversationValidator.js';
import crypto from 'crypto';

export async function listConversations(req, res, next) {
  try {
    const userId = req.user.id;

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data });
    }

    // Fallback in-memory
    const userConvs = Array.from(mockDb.conversations.values())
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    res.json({ success: true, data: userConvs });
  } catch (err) {
    next(err);
  }
}

export async function createConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const validated = createConversationSchema.parse(req.body);

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: validated.title,
          language: validated.language
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    const id = crypto.randomUUID();
    const newConv = {
      id,
      user_id: userId,
      title: validated.title,
      language: validated.language,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockDb.conversations.set(id, newConv);

    res.status(201).json({ success: true, data: newConv });
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (convError || !conv) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Conversation not found or unauthorized' }
        });
      }

      const { data: messages, error: msgError } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      return res.json({
        success: true,
        data: {
          ...conv,
          messages: messages || []
        }
      });
    }

    const conv = mockDb.conversations.get(id);
    if (!conv || conv.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found or unauthorized' }
      });
    }

    const messages = Array.from(mockDb.conversationMessages.values())
      .filter(m => m.conversation_id === id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.json({
      success: true,
      data: {
        ...conv,
        messages
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const validated = updateConversationSchema.parse(req.body);

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('conversations')
        .update({ title: validated.title, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Conversation not found or unauthorized' }
        });
      }
      return res.json({ success: true, data });
    }

    const conv = mockDb.conversations.get(id);
    if (!conv || conv.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found or unauthorized' }
      });
    }

    conv.title = validated.title;
    conv.updated_at = new Date().toISOString();
    mockDb.conversations.set(id, conv);

    res.json({ success: true, data: conv });
  } catch (err) {
    next(err);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return res.json({ success: true, message: 'Conversation deleted successfully' });
    }

    const conv = mockDb.conversations.get(id);
    if (!conv || conv.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found or unauthorized' }
      });
    }

    mockDb.conversations.delete(id);
    // Cascade delete messages
    for (const [msgId, msg] of mockDb.conversationMessages.entries()) {
      if (msg.conversation_id === id) {
        mockDb.conversationMessages.delete(msgId);
      }
    }

    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (err) {
    next(err);
  }
}

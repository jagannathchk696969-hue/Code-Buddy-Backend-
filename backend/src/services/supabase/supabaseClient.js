import { createClient } from '@supabase/supabase-js';
import config from '../../config/env.js';

let supabaseClient = null;
const isConfigured = Boolean(
  config.supabase.url &&
  !config.supabase.url.includes('your-project-id') &&
  config.supabase.publishableKey &&
  !config.supabase.publishableKey.includes('your_supabase')
);

if (isConfigured) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch (err) {
    console.warn('[SUPABASE] Failed to initialize Supabase client:', err.message);
  }
}

/**
 * In-memory fallback repository for offline / mock demonstration when Supabase is unconfigured.
 * Allows complete offline local development without database errors.
 */
class MockDatabase {
  constructor() {
    this.profiles = new Map();
    this.conversations = new Map();
    this.conversationMessages = new Map();
    this.practiceProblems = new Map();
    this.practiceAttempts = new Map();
    this.learningActivity = new Map();

    // Default demo user
    this.demoUser = {
      id: 'demo-user-123e4567-e89b-12d3-a456-426614174000',
      email: 'student@codebuddy.ai',
      user_metadata: { full_name: 'Demo Student' }
    };

    this.profiles.set(this.demoUser.id, {
      id: this.demoUser.id,
      display_name: 'Demo Student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  reset() {
    this.conversations.clear();
    this.conversationMessages.clear();
    this.practiceProblems.clear();
    this.practiceAttempts.clear();
    this.learningActivity.clear();
  }
}

export const mockDb = new MockDatabase();

/**
 * Returns a Supabase client.
 */
export function getSupabase() {
  return supabaseClient;
}

/**
 * Returns a user-scoped Supabase client that forwards the student's JWT token for RLS.
 */
export function getUserSupabase(bearerToken) {
  if (!isConfigured || !supabaseClient) {
    return null;
  }
  return createClient(config.supabase.url, config.supabase.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${bearerToken}`
      }
    }
  });
}

export function isSupabaseReady() {
  return isConfigured && supabaseClient !== null;
}

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  ai: {
    provider: (process.env.AI_PROVIDER || 'ollama').toLowerCase(),
    timeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '60000', 10),
    ollama: {
      baseUrl: (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, ''),
      model: process.env.OLLAMA_MODEL || 'gemma3:1b'
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash'
    }
  }
};

/**
 * Validates backend configuration at startup.
 * Returns diagnostic details rather than crashing abruptly.
 */
export function validateConfig() {
  const warnings = [];
  const errors = [];

  if (!['ollama', 'gemini'].includes(config.ai.provider)) {
    errors.push(`Invalid AI_PROVIDER '${config.ai.provider}'. Must be 'ollama' or 'gemini'.`);
  }

  if (config.ai.provider === 'gemini' && !config.ai.gemini.apiKey) {
    warnings.push('AI_PROVIDER is set to gemini, but GEMINI_API_KEY is not defined.');
  }

  if (!config.supabase.url || config.supabase.url.includes('your-project-id')) {
    warnings.push('SUPABASE_URL is not configured with a valid project URL. Mock fallback database mode will be enabled for local development.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  };
}

export default config;

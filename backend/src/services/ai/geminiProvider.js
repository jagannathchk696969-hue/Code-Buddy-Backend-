import { GoogleGenAI } from '@google/genai';
import { AiProvider } from './aiProvider.js';
import config from '../../config/env.js';

export class GeminiProvider extends AiProvider {
  constructor() {
    super('gemini', config.ai.gemini.model);
    this.apiKey = config.ai.gemini.apiKey;
    this.timeoutMs = config.ai.timeoutMs;
    this.client = null;

    if (this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.warn('[GEMINI] Failed to instantiate GoogleGenAI client:', err.message);
      }
    }
  }

  /**
   * Generates completion using official Google Gen AI SDK.
   */
  async generateCompletion(systemPrompt, userPrompt, options = {}) {
    if (!this.apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured in backend environment variables. " +
        "Please provide a valid GEMINI_API_KEY in backend/.env or set AI_PROVIDER=ollama for local offline mode."
      );
    }

    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: options.temperature ?? 0.2,
          ...(options.jsonMode && { responseMimeType: 'application/json' })
        }
      });

      clearTimeout(timer);

      const text = response.text || '';
      return {
        text,
        raw: response
      };
    } catch (err) {
      clearTimeout(timer);

      if (err.name === 'AbortError') {
        const timeoutSec = Math.round(this.timeoutMs / 1000);
        throw new Error(`Gemini request timed out after ${timeoutSec} seconds.`);
      }

      const msg = err.message || '';
      if (msg.includes('API_KEY_INVALID') || msg.includes('403') || msg.includes('unauthorized')) {
        throw new Error('Invalid Gemini API Key. Please verify your GEMINI_API_KEY in backend/.env.');
      }

      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429') || msg.includes('quota')) {
        throw new Error('Gemini API quota or rate limit exceeded. Please try again shortly or switch to local Ollama (AI_PROVIDER=ollama).');
      }

      if (msg.includes('not found') || msg.includes('is not supported')) {
        throw new Error(`Gemini model '${this.model}' is invalid or unsupported. Recommended active models: 'gemini-3.8-flash', 'gemini-3.5-flash-lite'.`);
      }

      throw new Error(`Gemini API error: ${msg}`);
    }
  }

  /**
   * Performs a health check by validating client setup and testing connectivity.
   */
  async healthCheck() {
    const start = Date.now();

    if (!this.apiKey) {
      return {
        status: 'error',
        latencyMs: 0,
        error: 'GEMINI_API_KEY is missing in backend environment.'
      };
    }

    try {
      if (!this.client) {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      }

      // Quick test call
      const res = await this.client.models.generateContent({
        model: this.model,
        contents: 'ping',
        config: {
          systemInstruction: 'Respond only with pong.'
        }
      });

      return {
        status: 'connected',
        latencyMs: Date.now() - start
      };
    } catch (err) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: err.message
      };
    }
  }
}

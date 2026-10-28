import { AiProvider } from './aiProvider.js';
import config from '../../config/env.js';

export class OllamaProvider extends AiProvider {
  constructor() {
    super('ollama', config.ai.ollama.model);
    this.baseUrl = config.ai.ollama.baseUrl;
    this.timeoutMs = config.ai.timeoutMs;
  }

  /**
   * Generates completion using Ollama's local chat API.
   */
  async generateCompletion(systemPrompt, userPrompt, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: false,
      options: {
        temperature: options.temperature ?? 0.2
      }
    };

    if (options.jsonMode) {
      payload.format = 'json';
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          throw new Error(`Ollama model '${this.model}' was not found. Please pull it locally: \`ollama pull ${this.model}\``);
        }
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return {
        text: data.message?.content || '',
        raw: data
      };
    } catch (err) {
      clearTimeout(timer);

      if (err.name === 'AbortError') {
        const timeoutSec = Math.round(this.timeoutMs / 1000);
        throw new Error(`Ollama request timed out after ${timeoutSec} seconds. Ensure the Ollama server has adequate CPU/GPU resources.`);
      }

      if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
        throw new Error(`Cannot connect to local Ollama server at ${this.baseUrl}. Please verify that Ollama is running (\`ollama serve\`).`);
      }

      throw err;
    }
  }

  /**
   * Performs a health check by testing tags endpoint and verifying the model is downloaded.
   */
  async healthCheck() {
    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        return {
          status: 'error',
          latencyMs,
          error: `Ollama returned HTTP status ${res.status}`
        };
      }

      const data = await res.json();
      const models = Array.isArray(data.models) ? data.models : [];
      const hasExactModel = models.some(m => m.name === this.model || m.name?.startsWith(this.model));

      if (!hasExactModel) {
        // If another model is downloaded in Ollama, dynamically adapt to it
        if (models.length > 0) {
          this.model = models[0].name;
          return {
            status: 'connected',
            latencyMs,
            model: this.model
          };
        }
        return {
          status: 'error',
          latencyMs,
          error: `Model '${this.model}' is not pulled in Ollama. Run \`ollama pull ${this.model}\`.`
        };
      }

      return {
        status: 'connected',
        latencyMs,
        model: this.model
      };
    } catch (err) {
      clearTimeout(timer);
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: `Could not reach Ollama at ${this.baseUrl}: ${err.message}`
      };
    }
  }
}

/**
 * Base Abstract Class for AI Providers.
 * Both Ollama and Gemini implementations conform to this contract.
 */
export class AiProvider {
  /**
   * @param {string} name Provider name (e.g., 'ollama', 'gemini')
   * @param {string} model Model name (e.g., 'gemma3:1b', 'gemini-3.8-flash')
   */
  constructor(name, model) {
    if (this.constructor === AiProvider) {
      throw new Error("Cannot instantiate abstract class AiProvider directly.");
    }
    this.name = name;
    this.model = model;
  }

  /**
   * Generates a completion from the underlying model.
   * @param {string} systemPrompt Instructional system prompt
   * @param {string} userPrompt User prompt content
   * @param {object} [options] Provider options (temperature, jsonMode, etc.)
   * @returns {Promise<{ text: string, raw?: any }>}
   */
  async generateCompletion(systemPrompt, userPrompt, options = {}) {
    throw new Error("Method 'generateCompletion()' must be implemented by subclass.");
  }

  /**
   * Checks connectivity and model availability.
   * @returns {Promise<{ status: 'connected' | 'error', latencyMs: number, error?: string }>}
   */
  async healthCheck() {
    throw new Error("Method 'healthCheck()' must be implemented by subclass.");
  }

  /**
   * Returns safe metadata without any credentials.
   * @returns {{ provider: string, model: string }}
   */
  getMetadata() {
    return {
      provider: this.name,
      model: this.model
    };
  }
}

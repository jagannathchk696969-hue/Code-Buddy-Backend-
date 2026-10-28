import test from 'node:test';
import assert from 'node:assert/strict';
import { OllamaProvider } from '../src/services/ai/ollamaProvider.js';
import { GeminiProvider } from '../src/services/ai/geminiProvider.js';
import { safeParseJson } from '../src/utils/jsonParser.js';

test('AI Provider & Normalization Tests', async (t) => {
  await t.test('OllamaProvider metadata returns provider and model without secrets', () => {
    const provider = new OllamaProvider();
    const meta = provider.getMetadata();
    assert.equal(meta.provider, 'ollama');
    assert.equal(meta.model, 'gemma3:1b');
  });

  await t.test('GeminiProvider throws descriptive error if GEMINI_API_KEY is missing', async () => {
    const provider = new GeminiProvider();
    provider.apiKey = ''; // simulate missing key
    await assert.rejects(
      async () => {
        await provider.generateCompletion('system', 'user');
      },
      /GEMINI_API_KEY is not configured/
    );
  });

  await t.test('OllamaProvider formats connection refused with friendly instructions', async () => {
    const provider = new OllamaProvider();
    provider.baseUrl = 'http://127.0.0.1:59999'; // Non-existent port
    provider.timeoutMs = 1500;

    await assert.rejects(
      async () => {
        await provider.generateCompletion('system', 'user');
      },
      /Cannot connect to local Ollama server/
    );
  });

  await t.test('safeParseJson strips markdown backticks and extracts inner JSON object', () => {
    const raw = '```json\n{\n  "summary": "Calculates sum of list",\n  "concepts": ["Loops"]\n}\n```';
    const parsed = safeParseJson(raw);
    assert.ok(parsed);
    assert.equal(parsed.summary, 'Calculates sum of list');
    assert.deepEqual(parsed.concepts, ['Loops']);
  });

  await t.test('safeParseJson gracefully handles text surrounding JSON', () => {
    const raw = 'Here is the JSON output:\n{"title": "Sum Two Numbers"}\nHope this helps!';
    const parsed = safeParseJson(raw);
    assert.ok(parsed);
    assert.equal(parsed.title, 'Sum Two Numbers');
  });
});

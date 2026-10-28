import test from 'node:test';
import assert from 'node:assert/strict';
import { AiService } from '../src/services/ai/aiService.js';

class MockAiProvider {
  constructor(name = 'mock', model = 'mock-model') {
    this.name = name;
    this.model = model;
  }
  async generateCompletion(systemPrompt, userPrompt, options) {
    if (userPrompt.includes('Level 1: Conceptual Hint')) {
      return {
        text: JSON.stringify({
          level: 1,
          levelName: 'Conceptual Hint',
          hint: 'Think about using a counter variable that increments under a condition.',
          nextLevelAvailable: 2
        })
      };
    }
    if (userPrompt.includes('Level 5')) {
      return {
        text: JSON.stringify({
          level: 5,
          levelName: 'Full Reference Solution',
          solutionCode: 'def solve(n):\n    return n * 2',
          algorithmExplanation: 'Multiplies input by 2.',
          keyPoints: ['One line return'],
          edgeCases: 'Handles zero.'
        })
      };
    }
    return { text: '{}' };
  }
  async healthCheck() {
    return { status: 'connected', latencyMs: 5 };
  }
}

test('Progressive Hints & Full Solution Tests', async (t) => {
  const service = new AiService();
  service.provider = new MockAiProvider();

  await t.test('getHint(level=1) returns conceptual hint only and flags nextLevelAvailable=2', async () => {
    const hint = await service.getHint('python', 'Even Number Counter', 'Count evens in list', 1);
    assert.equal(hint.level, 1);
    assert.equal(hint.levelName, 'Conceptual Hint');
    assert.equal(hint.nextLevelAvailable, 2);
    assert.ok(!hint.solutionCode, 'Hint Level 1 must NEVER contain full solution code');
  });

  await t.test('getSolution() provides complete reference solution with explanation', async () => {
    const sol = await service.getSolution('python', 'Even Number Counter', 'Count evens in list');
    assert.equal(sol.level, 5);
    assert.ok(sol.solutionCode);
    assert.ok(sol.algorithmExplanation);
    assert.ok(sol.disclaimer);
  });
});

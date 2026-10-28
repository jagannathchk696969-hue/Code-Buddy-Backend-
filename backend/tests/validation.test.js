import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('Input Validation & Safety Tests', async (t) => {
  await t.test('POST /api/ai/explain with empty code returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/ai/explain')
      .send({ language: 'python', code: '' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  await t.test('POST /api/ai/explain with unsupported language returns 400', async () => {
    const res = await request(app)
      .post('/api/ai/explain')
      .send({ language: 'rust_unsupported', code: 'fn main() {}' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error.details[0].message, /Language must be one of/i);
  });

  await t.test('POST /api/ai/hints rejecting Level 5 (must use solution endpoint)', async () => {
    const res = await request(app)
      .post('/api/ai/hints')
      .send({
        language: 'python',
        problemTitle: 'Fibonacci Sequence',
        problemDescription: 'Calculate nth Fibonacci number',
        requestedLevel: 5
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error.details[0].message, /Normal hints only go up to Level 4/i);
  });

  await t.test('POST /api/ai/practice/generate rejects invalid difficulty', async () => {
    const res = await request(app)
      .post('/api/ai/practice/generate')
      .send({
        language: 'c',
        topic: 'Pointers',
        difficulty: 'SuperHard'
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error.details[0].message, /Difficulty must be 'Beginner', 'Intermediate', or 'Advanced'/i);
  });
});

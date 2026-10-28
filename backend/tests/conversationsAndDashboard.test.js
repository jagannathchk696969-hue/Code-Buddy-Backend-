import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { mockDb } from '../src/services/supabase/supabaseClient.js';

test('Conversations, Ownership & Dashboard Tests', async (t) => {
  mockDb.reset();

  const userA = { id: 'user-a-1111-2222-3333-444444444444', email: 'userA@test.com' };
  const userB = { id: 'user-b-5555-6666-7777-888888888888', email: 'userB@test.com' };

  // Setup conversation owned by User B
  const convB = {
    id: 'conv-b-9999-0000-1111-222222222222',
    user_id: userB.id,
    title: 'Secret C++ Pointers of User B',
    language: 'cpp',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockDb.conversations.set(convB.id, convB);

  await t.test('User A cannot access User B conversation (returns 404/unauthorized)', async () => {
    // Current demo token resolves to mockDb.demoUser
    const res = await request(app)
      .get(`/api/conversations/${convB.id}`)
      .set('Authorization', 'Bearer demo-token');

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  await t.test('User creates conversation and retrieves own list', async () => {
    const createRes = await request(app)
      .post('/api/conversations')
      .set('Authorization', 'Bearer demo-token')
      .send({ title: 'My Python Loops', language: 'python' });

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.success, true);
    assert.equal(createRes.body.data.title, 'My Python Loops');

    const listRes = await request(app)
      .get('/api/conversations')
      .set('Authorization', 'Bearer demo-token');

    assert.equal(listRes.status, 200);
    assert.ok(listRes.body.data.some(c => c.title === 'My Python Loops'));
  });

  await t.test('Dashboard stats accurately aggregates attempts and streak from real records', async () => {
    // Save practice problem
    const probRes = await request(app)
      .post('/api/practice')
      .set('Authorization', 'Bearer demo-token')
      .send({
        language: 'python',
        topic: 'Loops',
        difficulty: 'Beginner',
        title: 'Count to 10',
        description: 'Print 1 to 10',
        inputDescription: 'None',
        outputDescription: '1 to 10',
        constraints: 'None',
        sampleInput: '',
        sampleOutput: '1..10'
      });

    assert.equal(probRes.status, 201);
    const problemId = probRes.body.data.id;

    // Record completed attempt
    const attemptRes = await request(app)
      .post(`/api/practice/${problemId}/attempts`)
      .set('Authorization', 'Bearer demo-token')
      .send({
        submittedCode: 'for i in range(1, 11): print(i)',
        hintsUsed: 1,
        completed: true
      });

    assert.equal(attemptRes.status, 200);
    assert.equal(attemptRes.body.data.completed, true);

    // Fetch dashboard stats
    const statsRes = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', 'Bearer demo-token');

    assert.equal(statsRes.status, 200);
    assert.equal(statsRes.body.data.totalAttempts, 1);
    assert.equal(statsRes.body.data.problemsCompleted, 1);
    assert.ok(statsRes.body.data.topLanguages.some(l => l.language === 'python'));
    assert.ok(statsRes.body.data.chartData.length === 7);
  });
});

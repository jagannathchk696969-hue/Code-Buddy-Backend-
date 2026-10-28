import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('Auth Middleware Tests', async (t) => {
  await t.test('GET /api/auth/me without token returns 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  await t.test('GET /api/conversations without token returns 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/conversations');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  await t.test('GET /api/auth/me with valid Bearer token returns 200 with user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer demo-token');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.ok(res.body.data.email);
  });
});

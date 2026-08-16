import { test } from 'node:test';
import assert from 'node:assert';
import { register } from 'node:module';

// Register the mock loader to intercept 'resend' imports
await register(new URL('./resend-mock-loader.mjs', import.meta.url).href, import.meta.url);

// Import the handler AFTER the loader is registered
const { default: handler } = await import('../api/waitlist.js');
// Import the mock to inspect sent emails / created contacts
const { Resend } = await import('./mock_resend.js');

// ── Test helpers ──
function makeReq(method, body, ip = '1.2.3.4') {
  const headers = {};
  if (ip) headers['x-forwarded-for'] = ip;
  return {
    method,
    headers,
    socket: { remoteAddress: ip },
    body: typeof body === 'string' ? body : body ? JSON.stringify(body) : undefined,
  };
}

function makeRes() {
  const calls = { status: null, body: null, ended: false, json: null };
  return {
    calls,
    status(code) { calls.status = code; return this; },
    end(body) { calls.ended = true; calls.body = body; return this; },
    json(obj) { calls.json = obj; calls.body = obj; calls.ended = true; return this; },
  };
}

function setEnv() {
  process.env.RESEND_API_KEY = 're_test_key';
  process.env.RESEND_FROM = 'Me <hello@test.com>';
  process.env.RESEND_AUDIENCE_ID = 'aud_test_123';
  process.env.WAITLIST_NOTIFY_TO = 'owner@test.com';
}

function clearEnv() {
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM;
  delete process.env.RESEND_AUDIENCE_ID;
  delete process.env.WAITLIST_NOTIFY_TO;
}

// ═══ Tests ═══
test('OPTIONS preflight returns 204', async () => {
  const req = makeReq('OPTIONS');
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.calls.status, 204);
  assert.strictEqual(res.calls.ended, true);
});

test('GET returns 405', async () => {
  const req = makeReq('GET');
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.calls.status, 405);
  assert.strictEqual(res.calls.json.ok, false);
});

test('Invalid email returns 400', async () => {
  setEnv();
  const req = makeReq('POST', { email: 'not-an-email' });
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.calls.status, 400);
  assert.strictEqual(res.calls.json.error, 'invalid_email');
});

test('Empty email returns 400', async () => {
  setEnv();
  const req = makeReq('POST', { email: '' });
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.calls.status, 400);
});

test('Valid email signup sends welcome + adds to audience', async () => {
  setEnv();
  Resend._reset();
  const req = makeReq('POST', { email: 'user@example.com' });
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.calls.status, 200);
  assert.strictEqual(res.calls.json.ok, true);
  assert.strictEqual(res.calls.json.emailSent, true);
  // Welcome email was sent
  const welcome = Resend._sentEmails.find(e => e.to === 'user@example.com' && e.subject.includes('Welcome'));
  assert.ok(welcome, 'welcome email should be sent');
  // Contact was added to audience
  assert.ok(Resend._contacts.includes('user@example.com'), 'contact should be added');
  // Internal notify email also sent
  const notify = Resend._sentEmails.find(e => e.to === 'owner@test.com' && e.subject.includes('New waitlist signup'));
  assert.ok(notify, 'internal notify email should be sent');
  // Tags set correctly
  assert.deepStrictEqual(welcome.tags, [{ name: 'type', value: 'waitlist_welcome' }]);
  // List-Unsubscribe header present
  assert.ok(welcome.headers['List-Unsubscribe'], 'List-Unsubscribe header should be present');
});

test('Chinese lang sends Chinese welcome email', async () => {
  setEnv();
  Resend._reset();
  const req = makeReq('POST', { email: 'zh@example.com', lang: 'zh' }, '5.6.7.8');
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.calls.status, 200);
  assert.strictEqual(res.calls.json.ok, true);
  const welcome = Resend._sentEmails.find(e => e.to === 'zh@example.com');
  assert.ok(welcome, 'welcome email should be sent');
  assert.ok(welcome.subject.includes('Me'), 'subject should contain Me');
  assert.ok(welcome.html.includes('你已在名单上'), 'Chinese welcome content should be present');
  assert.ok(welcome.text.includes('你已在名单上'), 'Chinese text content should be present');
});

test('Default lang is en when lang omitted', async () => {
  setEnv();
  Resend._reset();
  const req = makeReq('POST', { email: 'en@example.com' }, '9.10.11.12');
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.calls.status, 200);
  assert.strictEqual(res.calls.json.ok, true);
  const welcome = Resend._sentEmails.find(e => e.to === 'en@example.com');
  assert.ok(welcome, 'welcome email should be sent');
  assert.ok(welcome.html.includes('You are on the list'), 'English content should be present');
});

test('Missing RESEND_API_KEY returns 503', async () => {
  clearEnv();
  const req = makeReq('POST', { email: 'noenv@example.com' }, '13.14.15.16');
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.calls.status, 503);
  assert.strictEqual(res.calls.json.error, 'service_unavailable');
});

test('Duplicate contact (422) still returns 200 and sends email', async () => {
  setEnv();
  Resend._reset();
  // First signup — creates contact
  const req1 = makeReq('POST', { email: 'dup@example.com' }, '30.40.50.60');
  await handler(req1, makeRes());
  // Second signup with same email — Resend returns 422 for duplicate
  const req2 = makeReq('POST', { email: 'dup@example.com' }, '31.41.51.61');
  const res2 = makeRes();
  await handler(req2, res2);
  assert.strictEqual(res2.calls.status, 200);
  assert.strictEqual(res2.calls.json.ok, true);
  assert.strictEqual(res2.calls.json.emailSent, true);
});

test('Invalid JSON body returns 400', async () => {
  setEnv();
  const req = makeReq('POST', 'this is not json{{{', '17.18.19.20');
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.calls.status, 400);
  assert.strictEqual(res.calls.json.error, 'invalid_json');
});

test('Rate limiting kicks in after 5 requests from same IP', async () => {
  setEnv();
  const ip = '21.22.23.24';
  // Send 5 requests — all should succeed
  for (let i = 0; i < 5; i++) {
    const req = makeReq('POST', { email: 'ratetest' + i + '@example.com' }, ip);
    const res = makeRes();
    await handler(req, res);
    assert.strictEqual(res.calls.status, 200, 'request ' + (i + 1) + ' should succeed');
  }
  // 6th request should be rate limited
  const req = makeReq('POST', { email: 'ratetest5@example.com' }, ip);
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.calls.status, 429);
  assert.strictEqual(res.calls.json.error, 'rate_limited');
});

import { Resend } from 'resend';

/**
 * Waitlist signup endpoint.
 *
 * POST /api/waitlist
 *   { email: string, lang?: 'en' | 'zh' }
 *
 * What it does:
 *  1. Validates the email.
 *  2. Adds the contact to a Resend Audience (newsletter list).
 *  3. Sends a welcome email via Resend.
 *
 * Required env vars (set in Vercel):
 *  RESEND_API_KEY        — Resend API key
 *  RESEND_AUDIENCE_ID    — Resend Audience ID for the newsletter list
 *  RESEND_FROM           — Verified sender, e.g. "Me <hello@me.example.com>"
 *  WAITLIST_NOTIFY_TO    — (optional) internal address to ping on new signup
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limit (per serverless instance).
// Vercel serverless functions are stateless across invocations, so this is a
// best-effort first line of defense; the Resend Audience itself is the source
// of truth for de-duplication.
const recentSignups = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

function rateLimited(ip) {
  const now = Date.now();
  const entry = recentSignups.get(ip);
  if (!entry || now - entry.t > RATE_WINDOW_MS) {
    recentSignups.set(ip, { t: now, n: 1 });
    return false;
  }
  entry.n += 1;
  return entry.n > RATE_MAX;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function extractFromAddress(fromAddress) {
  const match = fromAddress.match(/<([^>]+)>/);
  return match ? match[1] : fromAddress;
}

const WELCOME = {
  en: {
    subject: 'Welcome to Me — you are on the first-batch list',
    html(email) {
      return [
        '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#f4f0e7;">',
        '<div style="font-size:28px;font-weight:700;margin-bottom:24px;">Me</div>',
        '<h1 style="font-size:22px;margin:0 0 16px;">You are on the list ✦</h1>',
        '<p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Thanks for joining the first-batch waitlist. We will notify you the moment Me launches — early-supporter pricing included.</p>',
        '<p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Me is a big toy that has nothing to do with AI. It asks questions, makes associations, then acts — refusing to hand you ready-made answers.</p>',
        '<hr style="border:none;border-top:1px solid #d8d0bf;margin:24px 0;">',
        '<p style="font-size:13px;color:#7a7464;margin:0;">You are receiving this because <strong>' + email + '</strong> joined the Me waitlist. No payment required. Unsubscribe anytime by replying to this email.</p>',
        '</div>',
      ].join('');
    },
    text(email) {
      return 'Me — You are on the first-batch list\n\nThanks for joining the waitlist. We will notify you the moment Me launches — early-supporter pricing included.\n\nMe is a big toy that has nothing to do with AI. It asks questions, makes associations, then acts — refusing to hand you ready-made answers.\n\nYou are receiving this because ' + email + ' joined the Me waitlist. No payment required. Unsubscribe anytime by replying to this email.';
    },
  },
  zh: {
    subject: '欢迎加入 Me 首批体验名单',
    html(email) {
      return [
        '<div style="font-family:-apple-system,BlinkMacSystemFont,\'PingFang SC\',\'Hiragino Sans GB\',\'Microsoft YaHei\',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#f4f0e7;">',
        '<div style="font-size:28px;font-weight:700;margin-bottom:24px;">Me</div>',
        '<h1 style="font-size:22px;margin:0 0 16px;">你已在名单上 ✦</h1>',
        '<p style="font-size:16px;line-height:1.6;margin:0 0 16px;">感谢加入首批体验名单。Me 发售时我们会第一时间通知你，含早鸟支持者专属价格。</p>',
        '<p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Me 是一台和 AI 没关系的大玩具。它提问、联想、然后行动——拒绝给你现成答案。</p>',
        '<hr style="border:none;border-top:1px solid #d8d0bf;margin:24px 0;">',
        '<p style="font-size:13px;color:#7a7464;margin:0;">你收到这封邮件是因为 <strong>' + email + '</strong> 加入了 Me 名单。无需付费。回复本邮件即可随时退订。</p>',
        '</div>',
      ].join('');
    },
    text(email) {
      return 'Me — 你已在名单上\n\n感谢加入首批体验名单。Me 发售时我们会第一时间通知你，含早鸟支持者专属价格。\n\nMe 是一台和 AI 没关系的大玩具。它提问、联想、然后行动——拒绝给你现成答案。\n\n你收到这封邮件是因为 ' + email + ' 加入了 Me 名单。无需付费。回复本邮件即可随时退订。';
    },
  },
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'rate_limited' });
  }

  // Parse body — Vercel may pass an object or a string
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid_json' });
  }

  const email = (body?.email || '').toString().trim().toLowerCase();
  const lang = body?.lang === 'zh' ? 'zh' : 'en';

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'invalid_email' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const fromAddress = process.env.RESEND_FROM;

  if (!apiKey || !fromAddress) {
    console.error('[waitlist] Missing RESEND_API_KEY or RESEND_FROM env var');
    return res.status(503).json({ ok: false, error: 'service_unavailable' });
  }

  const resend = new Resend(apiKey);
  const copy = WELCOME[lang];
  const fromEmail = extractFromAddress(fromAddress);

  // 1) Add to audience (newsletter list) if configured.
  //    Resend returns { data, error } — does NOT throw on API errors.
  //    A duplicate contact returns a 422 error, which is non-fatal
  //    (the user is already on the list).
  if (audienceId) {
    const { error: contactError } = await resend.contacts.create({
      audienceId,
      email,
    });
    if (contactError) {
      // 422 = duplicate contact, expected on re-signup — not a real error
      if (contactError.statusCode !== 422) {
        console.error('[waitlist] contact create failed:', contactError.message);
      }
    }
  }

  // 2) Send welcome email.
  //    Resend returns { data, error } — does NOT throw on API errors.
  let emailSent = false;
  const { error: sendError } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: copy.subject,
    html: copy.html(email),
    text: copy.text(email),
    tags: [{ name: 'type', value: 'waitlist_welcome' }],
    headers: {
      'List-Unsubscribe': '<mailto:' + fromEmail + '?subject=unsubscribe>',
    },
  });
  if (sendError) {
    console.error('[waitlist] resend email error:', sendError.message);
  } else {
    emailSent = true;
  }

  // 3) Optional internal notify — best effort, failures are logged only.
  const notifyTo = process.env.WAITLIST_NOTIFY_TO;
  if (notifyTo) {
    const { error: notifyError } = await resend.emails.send({
      from: fromAddress,
      to: notifyTo,
      subject: '[Me] New waitlist signup: ' + email,
      text: 'New waitlist signup.\n\nEmail: ' + email + '\nLang: ' + lang + '\nIP: ' + ip + '\nTime: ' + new Date().toISOString() + '\nWelcome sent: ' + emailSent,
    });
    if (notifyError) {
      console.error('[waitlist] notify failed:', notifyError.message);
    }
  }

  return res.status(200).json({ ok: true, emailSent });
}

/**
 * Test script: send a real welcome email via Resend.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx node scripts/send-test-email.mjs
 *
 * Or set it in .env first.
 */
import { Resend } from 'resend';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Load .env if present (simple parser)
try {
  const envContent = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[m[1]] = val;
    }
  }
} catch {}

const apiKey = process.env.RESEND_API_KEY;
const to = process.argv[2] || '2607653809@qq.com';

if (!apiKey || apiKey.startsWith('re_xxx')) {
  console.error('❌ No RESEND_API_KEY found.');
  console.error('   Set it via:  export RESEND_API_KEY=re_your_key_here');
  console.error('   Or create .env with:  RESEND_API_KEY=re_your_key_here');
  process.exit(1);
}

const resend = new Resend(apiKey);

const from = 'Me <onboarding@resend.dev>';

console.log('─'.repeat(60));
console.log('  Resend Email Test');
console.log('─'.repeat(60));
console.log('  From:    ' + from);
console.log('  To:      ' + to);
console.log('  API Key: re_' + '*'.repeat(apiKey.length - 6) + apiKey.slice(-4));
console.log('─'.repeat(60));
console.log('');

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: 'Welcome to Me — you are on the first-batch list',
  html: [
    '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#f4f0e7;">',
    '<div style="font-size:28px;font-weight:700;margin-bottom:24px;">Me</div>',
    '<h1 style="font-size:22px;margin:0 0 16px;">You are on the list ✦</h1>',
    '<p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Thanks for joining the first-batch waitlist. We will notify you the moment Me launches — early-supporter pricing included.</p>',
    '<p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Me is a big toy that has nothing to do with AI. It asks questions, makes associations, then acts — refusing to hand you ready-made answers.</p>',
    '<hr style="border:none;border-top:1px solid #d8d0bf;margin:24px 0;">',
    '<p style="font-size:13px;color:#7a7464;margin:0;">You are receiving this because <strong>' + to + '</strong> joined the Me waitlist. No payment required. Unsubscribe anytime by replying to this email.</p>',
    '</div>',
  ].join(''),
  text: 'Me — You are on the first-batch list\n\nThanks for joining the waitlist. We will notify you the moment Me launches — early-supporter pricing included.\n\nMe is a big toy that has nothing to do with AI. It asks questions, makes associations, then acts — refusing to hand you ready-made answers.\n\nYou are receiving this because ' + to + ' joined the Me waitlist. No payment required. Unsubscribe anytime by replying to this email.',
  tags: [{ name: 'type', value: 'waitlist_test' }],
});

if (error) {
  console.error('❌ Failed to send email:');
  console.error('   Error:', error.message);
  console.error('   Code:', error.name);
  console.error('   StatusCode:', error.statusCode);
  process.exit(1);
}

console.log('✅ Email sent successfully!');
console.log('   Email ID:', data.id);
console.log('');
console.log('  → Check your inbox at ' + to + ' (and spam folder if not visible)');
console.log('  → You can also view it in Resend dashboard → Emails');

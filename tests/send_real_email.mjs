/**
 * Real email send test — uses onboarding@resend.dev as sender
 * Sends a welcome email to the specified recipient via Resend.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx node tests/send_real_email.mjs
 *
 * With onboarding@resend.dev, Resend only allows sending to addresses
 * that are verified on your Resend account. Make sure the recipient
 * email is added under Resend → Contacts → Verified Emails.
 */
import { Resend } from 'resend';

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'Me <onboarding@resend.dev>';
const TO = process.env.TEST_TO || '2607653809@qq.com';
const LANG = process.env.TEST_LANG || 'zh';

if (!API_KEY) {
  console.error('❌ Missing RESEND_API_KEY. Get one at https://resend.com/api-keys');
  console.error('   Usage: RESEND_API_KEY=re_xxx node tests/send_real_email.mjs');
  process.exit(1);
}

console.log('━'.repeat(60));
console.log('  Resend Real Email Test');
console.log('━'.repeat(60));
console.log(`  From:   ${FROM}`);
console.log(`  To:     ${TO}`);
console.log(`  Lang:   ${LANG}`);
console.log(`  API Key: ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`);
console.log('━'.repeat(60));

const resend = new Resend(API_KEY);

const subject = LANG === 'zh'
  ? '欢迎加入 Me 首批体验名单'
  : 'Welcome to Me — you are on the first-batch list';

const html = LANG === 'zh'
  ? `<div style="font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#f4f0e7;">
  <div style="font-size:28px;font-weight:700;margin-bottom:24px;">Me</div>
  <h1 style="font-size:22px;margin:0 0 16px;">你已在名单上 ✦</h1>
  <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">感谢加入首批体验名单。Me 发售时我们会第一时间通知你，含早鸟支持者专属价格。</p>
  <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Me 是一台和 AI 没关系的大玩具。它提问、联想、然后行动——拒绝给你现成答案。</p>
  <hr style="border:none;border-top:1px solid #d8d0bf;margin:24px 0;">
  <p style="font-size:13px;color:#7a7464;margin:0;">你收到这封邮件是因为 <strong>${TO}</strong> 加入了 Me 名单。无需付费。回复本邮件即可随时退订。</p>
</div>`
  : `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#f4f0e7;">
  <div style="font-size:28px;font-weight:700;margin-bottom:24px;">Me</div>
  <h1 style="font-size:22px;margin:0 0 16px;">You are on the list ✦</h1>
  <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Thanks for joining the first-batch waitlist. We will notify you the moment Me launches — early-supporter pricing included.</p>
  <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Me is a big toy that has nothing to do with AI. It asks questions, makes associations, then acts — refusing to hand you ready-made answers.</p>
  <hr style="border:none;border-top:1px solid #d8d0bf;margin:24px 0;">
  <p style="font-size:13px;color:#7a7464;margin:0;">You are receiving this because <strong>${TO}</strong> joined the Me waitlist. No payment required. Unsubscribe anytime by replying to this email.</p>
</div>`;

const text = LANG === 'zh'
  ? `Me — 你已在名单上\n\n感谢加入首批体验名单。Me 发售时我们会第一时间通知你，含早鸟支持者专属价格。\n\nMe 是一台和 AI 没关系的大玩具。它提问、联想、然后行动——拒绝给你现成答案。\n\n你收到这封邮件是因为 ${TO} 加入了 Me 名单。无需付费。回复本邮件即可随时退订。`
  : `Me — You are on the first-batch list\n\nThanks for joining the waitlist. We will notify you the moment Me launches — early-supporter pricing included.\n\nMe is a big toy that has nothing to do with AI. It asks questions, makes associations, then acts — refusing to hand you ready-made answers.\n\nYou are receiving this because ${TO} joined the Me waitlist. No payment required. Unsubscribe anytime by replying to this email.`;

console.log('\n⏳ Sending via Resend...\n');

const { data, error } = await resend.emails.send({
  from: FROM,
  to: TO,
  subject,
  html,
  text,
  tags: [{ name: 'type', value: 'waitlist_welcome' }],
  headers: {
    'List-Unsubscribe': `<mailto:onboarding@resend.dev?subject=unsubscribe>`,
  },
});

if (error) {
  console.error('❌ Send FAILED:');
  console.error('   Error:', error.message);
  console.error('   Status:', error.statusCode);
  console.error('   Name:', error.name);
  console.error('\n   💡 Tip: With onboarding@resend.dev, the recipient must be');
  console.error('   a verified email on your Resend account.');
  console.error('   Add it at: Resend → Contacts → Verified Emails');
  process.exit(1);
}

console.log('✅ Email sent successfully!');
console.log('   Email ID:', data.id);
console.log(`   From:     ${FROM}`);
console.log(`   To:       ${TO}`);
console.log(`   Subject:  ${subject}`);
console.log('\n📬 Check your inbox (also check spam folder).');

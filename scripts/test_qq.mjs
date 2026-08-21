import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const to = process.argv[2] || '2607653809@qq.com';
const resend = new Resend(apiKey);

console.log('Sending to:', to);

const { data, error } = await resend.emails.send({
  from: 'Me <onboarding@resend.dev>',
  to,
  subject: 'Welcome to Me — you are on the first-batch list',
  html: '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#1a1a1a;background:#f4f0e7;"><div style="font-size:28px;font-weight:700;margin-bottom:24px;">Me</div><h1 style="font-size:22px;">You are on the list ✦</h1><p style="font-size:16px;line-height:1.6;">Thanks for joining the first-batch waitlist. We will notify you the moment Me launches — early-supporter pricing included.</p><p style="font-size:16px;line-height:1.6;">Me is a big toy that has nothing to do with AI. It asks questions, makes associations, then acts — refusing to hand you ready-made answers.</p><hr style="border:none;border-top:1px solid #d8d0bf;margin:24px 0;"><p style="font-size:13px;color:#7a7464;">You are receiving this because ' + to + ' joined the Me waitlist.</p></div>',
  text: 'Me — You are on the first-batch list\n\nThanks for joining the waitlist.',
  tags: [{ name: 'type', value: 'waitlist_test' }],
});

if (error) {
  console.error('❌ Error:', error.statusCode, error.name, error.message);
  process.exit(1);
}
console.log('✅ Sent! ID:', data.id);

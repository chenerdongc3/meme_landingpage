// ── i18n: EN / ZH language switching ──
// Default language is English. Persists choice in localStorage.

export const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中' },
];

const STORAGE_KEY = 'me_lang';
const DEFAULT_LANG = 'en';

export function getStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') return stored;
  } catch {}
  return DEFAULT_LANG;
}

function setStoredLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}

// Translation dictionary. Keys map to data-i18n attributes in the DOM.
export const STRINGS = {
  en: {
    // <html> lang attribute
    'lang': 'en',

    // meta / title
    'meta.description': 'Me is a big toy that has nothing to do with AI. It asks questions, makes associations, then acts — refusing to hand you ready-made answers. Discover this physical toy that refuses to answer, and reserve your first-batch experience.',
    'meta.og.title': 'Me — A big toy that has nothing to do with AI',
    'meta.og.description': 'It asks questions, makes associations, then acts. Refusing to hand you ready-made answers. Reserve your first-batch experience.',
    'meta.twitter.title': 'Me — A big toy that has nothing to do with AI',
    'meta.twitter.description': 'It asks questions, makes associations, then acts. Refusing to hand you ready-made answers. Reserve your first-batch experience.',
    'title': 'Me — A big toy that has nothing to do with AI | Reserve first-batch',

    // ld+json
    'ldjson.description': 'A big toy that has nothing to do with AI. It asks questions, makes associations, then acts — refusing to hand you ready-made answers.',
    'ldjson.category': 'Physical toy / Creative hardware',
    'ldjson.offer.description': 'First-batch experience spots now open for reservation',

    // hero (p1)
    'p1.deck': 'A big toy that has nothing to do with AI',
    'p1.cta': 'Reserve first-batch experience',
    'p1.risk': 'No payment needed · Just leave your email, we will notify you at launch',

    // p2
    'p2.title': 'We don\'t want to make another chatbot shell',
    'p2.body1': 'Giving answers, giving emotional value, voicing opinions — any large language model\'s companion product can do that.',
    'p2.body2': 'As hardware, it\'s closer to a toy. It should be more fun.',
    'p2.body3': 'It should also trust the human brain\'s agency, trust that people will make their own associations.',
    'p2.cta': 'I want this toy →',

    // p3
    'p3.title': 'Asking matters more than answering',
    'p3.body1': 'Language models have made opinion-spreading easy, even cheap.',
    'p3.body2': 'But only when the right question is asked, can the right answer be found.',
    'p3.body3': 'So what this machine outputs doesn\'t matter at all.',
    'p3.body4': 'We chose image memes because they have the lowest information density, no "I\'ve got you" commentary — the rest is left for humans to associate, understand, and act on.',

    // p4
    'p4.title': 'It will refuse to answer',
    'p4.body1': 'When Me recognizes you\'re stuck on the same recurring theme, it will refuse to answer.',
    'p4.body2': 'That\'s when an "Earth Online" task triggers — you must complete a To-Do before you can continue the conversation and printing.',
    'p4.body3': 'Yes, action is the answer and the way out of overthinking.',

    // p7
    'p7.title': 'What you\'ve asked,<br>matters more than what you\'ve done',
    'p7.body1': 'We built a backend system that stores your asked questions in the cloud, periodically producing a "Book of Questions" report.',
    'p7.body2': 'So what gets saved is not "what I did", but "what I\'m curious about, what I\'m puzzled by".',
    'p7.body3': 'The things a person keeps asking about may well be their talent / calling.',
    'p7.cta': 'Reserve my Book of Questions →',

    // p8
    'p8.title-pre': 'MeMe',
    'p8.title-mid': ' tears off the other half,<br>and becomes ',
    'p8.title-em': 'Me',
    'p8.deck': 'When I stop the endless taking, I might finally see myself (ME).',
    'p8.cta': 'Be among the first to get Me →',

    // anti-labels
    'anti.1': 'Not a Chatbot shell!',
    'anti.2': 'Not an emotional companion device!',

    // chapter marker
    'marker.total': '06',

    // status / hint
    'status.loading': 'Loading 3D toy',
    'status.ready': '3D toy loaded',
    'status.fallback': '3D could not load, showing static toy and full story',
    'hint.scroll': 'Scroll down',

    // noscript
    'noscript': 'Enable JavaScript to watch the full 3D scroll story; all chapter text is still readable on the page. To reserve, email hello@me.example.com.',

    // waitlist section
    'waitlist.title': 'Be among the first to get Me',
    'waitlist.sub': 'Leave your email and we will notify you the moment it launches. No charges, no spam, unsubscribe anytime.',
    'waitlist.label': 'Email',
    'waitlist.placeholder': 'you@example.com',
    'waitlist.submit': 'Reserve first-batch experience',
    'waitlist.risk': 'No payment needed · Just your email · Unsubscribe anytime',
    'waitlist.submitting': 'Submitting…',
    'waitlist.success': '✓ Reserved! We will notify you the moment it launches.',
    'waitlist.done': 'Reserved ✓',
    'waitlist.error': 'Please enter a valid email address',
    'waitlist.rate': 'Too many attempts. Please try again in a minute.',
    'waitlist.fail': 'Something went wrong. Please try again or email us directly.',

    // social proof
    'proof.1.num': '—',
    'proof.1.label': 'people reserved',
    'proof.2.num': '1st',
    'proof.2.label': 'Limited batch',
    'proof.3.num': '0',
    'proof.3.label': 'deposit',

    // FAQ
    'faq.title': 'FAQ',
    'faq.1.q': 'What exactly is Me?',
    'faq.1.a': 'Me is a physical toy. It has a shell, a paper path, a printer, and a button, but it doesn\'t connect to a large language model or output text answers. It responds to your questions with image memes, refuses to answer when you\'re stuck in a rut, and gives you an "Earth Online" action task.',
    'faq.2.q': 'How is it different from AI hardware or companion robots?',
    'faq.2.a': 'It\'s not a Chatbot shell, not an emotional companion device. It doesn\'t give you answers, emotional value, or opinions. It trusts the human brain\'s agency and hands association and understanding back to people themselves.',
    'faq.3.q': 'What is the "Book of Questions"?',
    'faq.3.a': 'Me stores your asked questions in the cloud and periodically generates a "Book of Questions" report. What gets recorded is not "what you did", but "what you\'re curious about, what puzzles you" — the things you keep asking about may well be your talent.',
    'faq.4.q': 'Do I need to pay to reserve?',
    'faq.4.a': 'No. Reservation is completely free — just leave your email. We will notify you at launch, and you can decide whether to buy then. You can unsubscribe anytime, and we won\'t spam you.',
    'faq.5.q': 'When will I get it?',
    'faq.5.a': 'We are doing small-batch manufacturing. After reserving, you will receive launch notifications and early-supporter exclusive pricing as soon as possible.',

    // footer
    'footer.copy': '© 2026 Me',
  },

  zh: {
    // <html> lang attribute
    'lang': 'zh-CN',

    // meta / title
    'meta.description': 'Me 是一台和 AI 没关系的大玩具。它提问、联想、然后行动——拒绝给你现成答案。了解这台会拒绝回答的实体玩具，预约首批体验。',
    'meta.og.title': 'Me — 一台和 AI 没关系的大玩具',
    'meta.og.description': '它提问、联想、然后行动。拒绝给你现成答案。预约首批体验。',
    'meta.twitter.title': 'Me — 一台和 AI 没关系的大玩具',
    'meta.twitter.description': '它提问、联想、然后行动。拒绝给你现成答案。预约首批体验。',
    'title': 'Me — 一台和 AI 没关系的大玩具 | 预约首批体验',

    // ld+json
    'ldjson.description': '一台和 AI 没关系的大玩具。它提问、联想、然后行动——拒绝给你现成答案。',
    'ldjson.category': '实体玩具 / 创意硬件',
    'ldjson.offer.description': '首批体验名额预约中',

    // hero (p1)
    'p1.deck': '这是一台和 AI 没关系的大玩具',
    'p1.cta': '预约首批体验',
    'p1.risk': '无需付费 · 仅留邮箱，首发时通知你',

    // p2
    'p2.title': '我们不想再做一个套壳的 Chatbot',
    'p2.body1': '给答案、给情绪价值、发表观点，这件事任何一家大模型的情绪陪伴产品都做得了。',
    'p2.body2': '作为硬件，它更接近玩具，更应该好玩。',
    'p2.body3': '也应该相信人脑的主观能动性，相信人自己会联想。',
    'p2.cta': '我想要这台玩具 →',

    // p3
    'p3.title': '提问比答案更重要',
    'p3.body1': '语言模型已经把观点发散变得易得，甚至廉价。',
    'p3.body2': '但只有问出了对的问题，才有可能找到对的答案。',
    'p3.body3': '所以这台机器输出的是什么，根本就不重要。',
    'p3.body4': '我们选择图片 meme，是因为它有最低的信息密度，没有"稳稳接住你"的注解，剩下的交给人类自己去联想、去理解、去行动。',

    // p4
    'p4.title': '它会拒绝回答',
    'p4.body1': '当 Me 识别到你反复困在同一个母题里，它会拒绝作出回答。',
    'p4.body2': '这时候地球 Online 任务触发，你要完成一个 To Do，才可以接着对话和打印。',
    'p4.body3': '是的，行动才是钻牛角尖的答案和解法。',

    // p7
    'p7.title': '你问过什么，<br>比你做过什么更像你',
    'p7.body1': '我们搭建了后端系统，会云端储存提问过的问题，定期产出"问题之书"的报告。',
    'p7.body2': '因而存下来的不是"我做了什么"，而是"我好奇什么、我困惑什么"。',
    'p7.body3': '一个人反复在问的东西，可能就是他的天赋 / Calling 所在。',
    'p7.cta': '预约我的问题之书 →',

    // p8
    'p8.title-pre': 'MeMe',
    'p8.title-mid': ' 撕掉另一半，<br>就变成了 ',
    'p8.title-em': 'Me',
    'p8.deck': '当我停下不间断的索取，我或许才看见了自己（ME）。',
    'p8.cta': '成为第一批拿到 Me 的人 →',

    // anti-labels
    'anti.1': '不是 Chatbot 套壳！',
    'anti.2': '不是情绪陪伴硬件！',

    // chapter marker
    'marker.total': '06',

    // status / hint
    'status.loading': '正在加载 3D 玩具',
    'status.ready': '3D 玩具已加载',
    'status.fallback': '3D 无法加载，已显示静态玩具与完整故事',
    'hint.scroll': '向下滑动',

    // noscript
    'noscript': '启用 JavaScript 可以观看完整的 3D 滚动叙事；所有章节文字仍可在页面中阅读。预约请发邮件至 hello@me.example.com。',

    // waitlist section
    'waitlist.title': '成为第一批拿到 Me 的人',
    'waitlist.sub': '留下邮箱，首发时第一时间通知你。不收费、不群发、随时退订。',
    'waitlist.label': '邮箱',
    'waitlist.placeholder': 'you@example.com',
    'waitlist.submit': '预约首批体验',
    'waitlist.risk': '无需付费 · 仅留邮箱 · 随时退订',
    'waitlist.submitting': '提交中…',
    'waitlist.success': '✓ 预约成功！首发时我们会第一时间通知你。',
    'waitlist.done': '已预约 ✓',
    'waitlist.error': '请输入有效的邮箱地址',
    'waitlist.rate': '操作太频繁，请稍后再试。',
    'waitlist.fail': '出了点问题，请重试或直接邮件联系我们。',

    // social proof
    'proof.1.num': '—',
    'proof.1.label': '人已预约',
    'proof.2.num': '首批',
    'proof.2.label': '限量制造',
    'proof.3.num': '0',
    'proof.3.label': '元预约金',

    // FAQ
    'faq.title': '常见问题',
    'faq.1.q': 'Me 到底是什么？',
    'faq.1.a': 'Me 是一台实体玩具。它有外壳、纸路、打印机和按钮，但不连接大模型、不输出文字答案。它用图片 meme 回应你的提问，当你钻牛角尖时会拒绝回答，并给你一个"地球 Online"的行动任务。',
    'faq.2.q': '它和 AI 硬件、陪伴机器人有什么区别？',
    'faq.2.a': '它不是 Chatbot 套壳，不是情绪陪伴硬件。它不给你答案、不给你情绪价值、不发表观点。它相信人脑的主观能动性，把联想和理解交还给人自己。',
    'faq.3.q': '"问题之书"是什么？',
    'faq.3.a': 'Me 会云端储存你提问过的问题，定期生成一份"问题之书"报告。记录的不是"你做过什么"，而是"你好奇什么、困惑什么"——你反复在问的东西，可能就是你的天赋所在。',
    'faq.4.q': '预约要付钱吗？',
    'faq.4.a': '不需要。预约完全免费，只需留下邮箱。首发时我们会通知你，你可以再决定是否购买。随时可以退订，不会群发打扰。',
    'faq.5.q': '什么时候能拿到？',
    'faq.5.a': '我们正在做小批量制造。预约后你会在第一时间收到首发通知和早期支持者专属价格。',

    // footer
    'footer.copy': '© 2026 Me',
  },
};

// Apply translations to the DOM for the given language.
export function applyLang(lang) {
  const dict = STRINGS[lang] || STRINGS[DEFAULT_LANG];

  // <html lang="...">
  document.documentElement.lang = dict['lang'];

  // Meta tags
  const setMeta = (selector, attr, content) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, content);
  };
  setMeta('meta[name="description"]', 'content', dict['meta.description']);
  setMeta('meta[name="twitter:title"]', 'content', dict['meta.twitter.title']);
  setMeta('meta[name="twitter:description"]', 'content', dict['meta.twitter.description']);
  setMeta('meta[property="og:title"]', 'content', dict['meta.og.title']);
  setMeta('meta[property="og:description"]', 'content', dict['meta.og.description']);
  setMeta('meta[property="og:locale"]', 'content', lang === 'zh' ? 'zh_CN' : 'en_US');

  // <title>
  document.title = dict['title'];

  // ld+json
  const ld = document.querySelector('script[type="application/ld+json"]');
  if (ld) {
    try {
      const obj = JSON.parse(ld.textContent);
      obj.description = dict['ldjson.description'];
      obj.category = dict['ldjson.category'];
      obj.offers.description = dict['ldjson.offer.description'];
      ld.textContent = JSON.stringify(obj, null, 2);
    } catch {}
  }

  // All elements with data-i18n (textContent)
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  // Elements with data-i18n-html (innerHTML, for <br> support)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.dataset.i18nHtml;
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  // Elements with data-i18n-attr="attrName:key"
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const specs = el.dataset.i18nAttr.split(';');
    specs.forEach((spec) => {
      const [attr, key] = spec.split(':').map((s) => s.trim());
      if (attr && key && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
    });
  });

  // p8 composite title (has sub-spans for styled fragments)
  const p8Title = document.querySelector('[data-chapter="p8"] h2');
  if (p8Title) {
    const pre = p8Title.querySelector('span');
    const em = p8Title.querySelector('em');
    const mid = dict['p8.title-mid'];
    p8Title.innerHTML = `<span>${dict['p8.title-pre']}</span>${mid}<em>${dict['p8.title-em']}</em>`;
  }

  // noscript
  const noscript = document.querySelector('.noscript-copy');
  if (noscript) noscript.textContent = dict['noscript'];

  // Update language switcher active state
  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    const isActive = btn.dataset.langBtn === lang;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  // Dispatch event so other modules can react (e.g., app.js dynamic strings)
  window.dispatchEvent(new CustomEvent('me:langchange', { detail: { lang, dict } }));
}

export function initI18n() {
  const lang = getStoredLang();
  applyLang(lang);

  // Wire up language switch buttons
  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.langBtn;
      if (next === getStoredLang()) return;
      setStoredLang(next);
      applyLang(next);
    });
  });

  return lang;
}

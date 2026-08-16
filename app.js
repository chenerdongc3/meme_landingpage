import { clamp01, deriveStoryState } from './story-timeline.js';
import { createMeScene } from './me-scene.js';
import { initI18n, getStoredLang, STRINGS } from './i18n.js';

const root = document.documentElement;
const story = document.getElementById('scrollStory');
const stage = document.getElementById('stageRoot');
const canvas = document.getElementById('webglCanvas');
const chapters = Array.from(document.querySelectorAll('[data-chapter]'));
const progressBar = document.querySelector('#storyProgress span');
const chapterNumber = document.getElementById('chapterNumber');
const status = document.getElementById('webglStatus');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const compactQuery = window.matchMedia('(max-width: 760px)');

// Helper: get translated string for current language
function t(key) {
  const lang = getStoredLang();
  const dict = STRINGS[lang] || STRINGS.en;
  return dict[key] !== undefined ? dict[key] : key;
}

let storyTop = 0;
let storyDistance = 1;
let targetProgress = 0;
let renderedProgress = -1;
let scene = null;
let pointerX = 0;
let pointerY = 0;
let targetPointerX = 0;
let targetPointerY = 0;
let running = true;

function setFallback(error) {
  root.classList.remove('webgl-ready');
  root.classList.add('webgl-fallback');
  if (status) {
    status.textContent = t('status.fallback');
    status.dataset.transient = '1';
  }
  if (error) console.warn('Me 3D fallback:', error.message);
}

function setReady() {
  root.classList.remove('webgl-fallback');
  root.classList.add('webgl-ready');
  if (status) {
    status.textContent = t('status.ready');
    status.dataset.transient = '1';
  }
}

function buildScene() {
  scene?.dispose();
  scene = null;
  root.classList.toggle('reduced-motion', reducedMotionQuery.matches);
  try {
    scene = createMeScene(canvas, {
      compact: compactQuery.matches,
      reducedMotion: reducedMotionQuery.matches,
      onReady: setReady,
      onFailure: setFallback,
    });
  } catch (error) {
    setFallback(error);
  }
}

function measure() {
  storyTop = story.offsetTop;
  storyDistance = Math.max(1, story.offsetHeight - window.innerHeight);
  scene?.resize();
  updateFromScroll();
}

function updateFromScroll() {
  targetProgress = clamp01((window.scrollY - storyTop) / storyDistance);
}

function updateDom(state) {
  stage.style.setProperty('--progress', state.progress.toFixed(4));
  stage.style.setProperty('--chapter-progress', state.chapterProgress.toFixed(4));
  stage.style.setProperty('--refusal', state.refusal.toFixed(4));
  stage.style.setProperty('--archive', state.archive.toFixed(4));
  stage.style.setProperty('--tear', state.tear.toFixed(4));
  root.className = root.className
    .replace(/\bis-p\d+\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  root.classList.add(`is-${state.chapter}`);

  chapters.forEach((chapter) => {
    const active = chapter.dataset.chapter === state.chapter;
    chapter.classList.toggle('is-active', active);
    chapter.setAttribute('aria-current', active ? 'step' : 'false');
  });
  if (progressBar) progressBar.style.transform = `scaleY(${state.progress})`;
  if (chapterNumber) chapterNumber.textContent = String(state.chapterIndex + 1).padStart(2, '0');
}

function render(time) {
  if (!running) return;
  pointerX += (targetPointerX - pointerX) * 0.055;
  pointerY += (targetPointerY - pointerY) * 0.055;
  if (Math.abs(targetProgress - renderedProgress) > 0.00001) {
    renderedProgress = targetProgress;
  }
  const state = deriveStoryState(renderedProgress < 0 ? 0 : renderedProgress);
  updateDom(state);
  scene?.setState(state);
  scene?.setPointer(pointerX, pointerY);
  scene?.render(time);
  window.__ME_STORY__.state = state;
  requestAnimationFrame(render);
}

function onPointerMove(event) {
  if (reducedMotionQuery.matches || compactQuery.matches) return;
  targetPointerX = (event.clientX / window.innerWidth - 0.5) * 2;
  targetPointerY = (event.clientY / window.innerHeight - 0.5) * 2;
}

function resetPointer() {
  targetPointerX = 0;
  targetPointerY = 0;
}

function rebuildForMediaChange() {
  buildScene();
  measure();
}

window.__ME_STORY__ = {
  state: deriveStoryState(0),
  renderAt(progress) {
    targetProgress = clamp01(progress);
    renderedProgress = targetProgress;
    const state = deriveStoryState(targetProgress);
    updateDom(state);
    scene?.setState(state);
    scene?.render(performance.now());
    this.state = state;
    return state;
  },
  get hasWebGL() {
    return root.classList.contains('webgl-ready');
  },
};

window.addEventListener('scroll', updateFromScroll, { passive: true });
window.addEventListener('resize', measure, { passive: true });
window.addEventListener('pointermove', onPointerMove, { passive: true });
window.addEventListener('pointerleave', resetPointer, { passive: true });
window.addEventListener('pagehide', () => {
  running = false;
  scene?.dispose();
}, { once: true });
reducedMotionQuery.addEventListener('change', rebuildForMediaChange);
compactQuery.addEventListener('change', rebuildForMediaChange);

buildScene();
measure();
requestAnimationFrame(render);

// ── i18n: initialize language (default English) ──
initI18n();

// ── Conversion layer: waitlist form + CTA tracking ──
const reserveForm = document.getElementById('reserveForm');
const emailInput = document.getElementById('emailInput');
const formStatus = document.getElementById('formStatus');
const waitlistCount = document.getElementById('waitlistCount');

// React to language changes: update dynamic status strings
window.addEventListener('me:langchange', (event) => {
  const dict = event.detail.dict;
  // Update 3D status text (only if not in a transient success/error state)
  if (status && !status.dataset.transient) {
    if (root.classList.contains('webgl-ready')) {
      status.textContent = dict['status.ready'];
    } else if (root.classList.contains('webgl-fallback')) {
      status.textContent = dict['status.fallback'];
    } else {
      status.textContent = dict['status.loading'];
    }
  }
  // Update form status if not showing success/error
  if (formStatus && !formStatus.dataset.transient) {
    formStatus.textContent = dict['waitlist.risk'];
  }
  // Update chapter marker total
  const markerTotal = document.querySelector('.chapter-marker span:last-child');
  if (markerTotal) markerTotal.textContent = dict['marker.total'];
});

// Simulated social proof count (replace with real API when backend exists)
const BASE_COUNT = 247;
function initWaitlistCount() {
  if (!waitlistCount) return;
  const stored = parseInt(localStorage.getItem('me_waitlist_count') || '0', 10);
  const display = BASE_COUNT + stored;
  waitlistCount.textContent = display > 999 ? `${(display / 1000).toFixed(1)}k` : String(display);
}
initWaitlistCount();

function trackCta(label) {
  // Hook for analytics (GTM, GA4, etc.) — replace with real integration
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'cta_click', { cta_label: label });
  }
  console.debug('[CTA]', label);
}

// Track all CTA clicks
document.querySelectorAll('[data-cta]').forEach((el) => {
  el.addEventListener('click', () => trackCta(el.dataset.cta));
});

async function submitWaitlist(email, lang) {
  const res = await fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, lang }),
  });
  // res.json() may fail on empty bodies; guard it.
  let data = {};
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

if (reserveForm) {
  reserveForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.focus();
      emailInput.setAttribute('aria-invalid', 'true');
      if (formStatus) {
        formStatus.textContent = t('waitlist.error');
        formStatus.className = 'form-risk-reversal form-status--error';
        formStatus.dataset.transient = '1';
      }
      return;
    }

    emailInput.removeAttribute('aria-invalid');

    const submitButton = reserveForm.querySelector('.form-submit');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = t('waitlist.submitting');
    }

    try {
      const lang = getStoredLang();
      const { status, data } = await submitWaitlist(email, lang);

      if (status === 200 || status === 422) {
        // 422 = already subscribed in Resend Audience — treat as success too
        const current = parseInt(localStorage.getItem('me_waitlist_count') || '0', 10);
        localStorage.setItem('me_waitlist_count', String(current + 1));
        initWaitlistCount();

        if (formStatus) {
          formStatus.textContent = t('waitlist.success');
          formStatus.className = 'form-risk-reversal form-status--success';
          formStatus.dataset.transient = '1';
        }
        const field = reserveForm.querySelector('.form-field');
        if (field) field.style.display = 'none';
        if (submitButton) {
          submitButton.textContent = t('waitlist.done');
          submitButton.disabled = true;
          submitButton.style.opacity = '0.6';
        }
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'waitlist_signup', { method: 'email' });
        }
      } else if (status === 429) {
        // Rate limited
        if (formStatus) {
          formStatus.textContent = t('waitlist.rate');
          formStatus.className = 'form-risk-reversal form-status--error';
          formStatus.dataset.transient = '1';
        }
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = t('waitlist.submit');
        }
      } else {
        // Other server error
        if (formStatus) {
          formStatus.textContent = t('waitlist.fail');
          formStatus.className = 'form-risk-reversal form-status--error';
          formStatus.dataset.transient = '1';
        }
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = t('waitlist.submit');
        }
      }
    } catch (err) {
      // Network error — degrade gracefully, still acknowledge locally
      console.error('[Waitlist] network error:', err);
      if (formStatus) {
        formStatus.textContent = t('waitlist.fail');
        formStatus.className = 'form-risk-reversal form-status--error';
        formStatus.dataset.transient = '1';
      }
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = t('waitlist.submit');
      }
    }
  });

  // Clear error state on input
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.removeAttribute('aria-invalid');
      if (formStatus && formStatus.classList.contains('form-status--error')) {
        formStatus.textContent = t('waitlist.risk');
        formStatus.className = 'form-risk-reversal';
        delete formStatus.dataset.transient;
      }
    });
  }
}

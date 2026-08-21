import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8899/index.html';
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForFunction(
  () => document.documentElement.classList.contains('webgl-ready')
    || document.documentElement.classList.contains('webgl-fallback'),
  null, { timeout: 10000 },
);

const probes = [
  ['p1', 0.07], ['p2', 0.225], ['p3', 0.40], ['p4', 0.575],
  ['p7', 0.75], ['p8', 0.93],
  ['p1-p2 edge', 0.14], ['p2-p3 edge', 0.31], ['p3-p4 edge', 0.49],
  ['p4-p7 edge', 0.66], ['p7-p8 edge', 0.84],
];

console.log('chapter\t\tglass\tprogress');
for (const [label, progress] of probes) {
  await page.evaluate((v) => window.__ME_STORY__.renderAt(v), progress);
  await page.waitForTimeout(60);
  const out = await page.evaluate(() => {
    const stage = document.getElementById('stageRoot');
    const active = document.querySelector('.chapter.is-active');
    const cs = active ? getComputedStyle(active, '::before') : null;
    return {
      glass: stage.style.getPropertyValue('--glass') || '(unset)',
      backdrop: cs ? cs.backdropFilter || cs.webkitBackdropFilter : 'no-active',
      opacity: cs ? cs.opacity : 'n/a',
      chapter: active ? active.dataset.chapter : 'none',
    };
  });
  console.log(`${label.padEnd(14)}\t${out.glass}\t${out.chapter}\t${out.opacity}`);
}
await browser.close();

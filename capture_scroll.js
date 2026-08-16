import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:8877/index.html';
const outputDir = path.resolve(process.env.OUTPUT_DIR ?? 'preview/threejs');
const defaultChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = process.env.CHROME_PATH
  ?? (existsSync(defaultChrome) ? defaultChrome : undefined);
const probes = [
  ['p1', 0.07],
  ['p2', 0.225],
  ['p3', 0.40],
  ['p4', 0.575],
  ['p7', 0.75],
  ['p8', 0.93],
];
const transitionProbes = [
  ['p1-p2', 0.14],
  ['p2-p3', 0.31],
  ['p3-p4', 0.49],
  ['p4-p7', 0.66],
  ['p7-p8', 0.84],
];
const viewports = process.env.VIEWPORTS_JSON
  ? JSON.parse(process.env.VIEWPORTS_JSON)
  : [
      { name: 'desktop', width: 1440, height: 1000 },
      { name: 'mobile', width: 390, height: 844 },
    ];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});

const report = [];
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => document.documentElement.classList.contains('webgl-ready')
        || document.documentElement.classList.contains('webgl-fallback'),
      null,
      { timeout: 10_000 },
    );
    const webglReady = await page.evaluate(() => window.__ME_STORY__?.hasWebGL === true);
    if (!webglReady) throw new Error(`${viewport.name}: WebGL fallback was active`);
    const cueCount = await page.locator('.chapter-index').count();
    if (cueCount !== 0) throw new Error(`${viewport.name}: chapter cue labels remain`);

    if (viewport.name === 'desktop') {
      for (const [, boundary] of transitionProbes) {
        const [before, after] = await page.evaluate((value) => {
          const fields = ['sceneX', 'sceneY', 'sceneZ', 'sceneYaw'];
          const pick = (state) => Object.fromEntries(fields.map((key) => [key, state[key]]));
          return [
            pick(window.__ME_STORY__.renderAt(value - 0.0001)),
            pick(window.__ME_STORY__.renderAt(value + 0.0001)),
          ];
        }, boundary);
        for (const key of ['sceneX', 'sceneY', 'sceneZ', 'sceneYaw']) {
          const delta = Math.abs(after[key] - before[key]);
          if (!Number.isFinite(before[key]) || !Number.isFinite(after[key]) || delta >= 0.03) {
            throw new Error(`desktop: ${key} jumped by ${delta} at ${boundary}`);
          }
        }
      }
    }

    for (const [chapter, progress] of probes) {
      await page.evaluate((value) => window.__ME_STORY__.renderAt(value), progress);
      await page.waitForTimeout(220);
      const active = page.locator('.chapter.is-active');
      const activeChapter = await active.getAttribute('data-chapter');
      const box = await active.boundingBox();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      const insideViewport = Boolean(
        box
        && box.x >= -1
        && box.y >= -1
        && box.x + box.width <= viewport.width + 1
        && box.y + box.height <= viewport.height + 1,
      );
      if (activeChapter !== chapter) {
        throw new Error(`${viewport.name}: expected ${chapter}, got ${activeChapter}`);
      }
      if (overflow > 0) throw new Error(`${viewport.name}/${chapter}: horizontal overflow ${overflow}px`);
      if (!insideViewport) throw new Error(`${viewport.name}/${chapter}: active copy is clipped`);
      const filename = path.join(outputDir, `${viewport.name}-${chapter}.png`);
      await page.screenshot({ path: filename });
      report.push({ viewport: viewport.name, chapter, overflow, insideViewport, filename });
    }

    if (viewport.name === 'desktop') {
      for (const [name, progress] of transitionProbes) {
        await page.evaluate((value) => window.__ME_STORY__.renderAt(value), progress);
        await page.waitForTimeout(450);
        const filename = path.join(outputDir, `desktop-transition-${name}.png`);
        await page.screenshot({ path: filename });
        report.push({ viewport: viewport.name, transition: name, progress, filename });
      }
    }

    if (consoleErrors.length || pageErrors.length) {
      throw new Error(
        `${viewport.name}: browser errors: ${[...consoleErrors, ...pageErrors].join(' | ')}`,
      );
    }
    await page.close();
  }

  const reduced = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  await reduced.goto(baseUrl, { waitUntil: 'networkidle' });
  await reduced.waitForFunction(() => document.documentElement.classList.contains('webgl-ready'));
  for (const [chapter, progress] of [['p3', 0.40], ['p8', 0.93]]) {
    await reduced.evaluate((value) => window.__ME_STORY__.renderAt(value), progress);
    await reduced.waitForTimeout(100);
    const activeChapter = await reduced.locator('.chapter.is-active').getAttribute('data-chapter');
    const reducedClass = await reduced.evaluate(
      () => document.documentElement.classList.contains('reduced-motion'),
    );
    if (activeChapter !== chapter || !reducedClass) {
      throw new Error(`reduced-motion: expected ${chapter} with reduced-motion class`);
    }
    const filename = path.join(outputDir, `reduced-${chapter}.png`);
    await reduced.screenshot({ path: filename });
    report.push({ viewport: 'reduced', chapter, reducedMotion: true, filename });
  }
  await reduced.close();

  const fallback = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
      if (String(type).startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });
  await fallback.goto(baseUrl, { waitUntil: 'networkidle' });
  await fallback.waitForFunction(
    () => document.documentElement.classList.contains('webgl-fallback'),
  );
  await fallback.evaluate(() => window.__ME_STORY__.renderAt(0.93));
  await fallback.waitForTimeout(220);
  const fallbackChapter = await fallback.locator('.chapter.is-active').getAttribute('data-chapter');
  const posterVisible = await fallback.locator('#productPoster').isVisible();
  if (fallbackChapter !== 'p8' || !posterVisible) {
    throw new Error('fallback: P8 copy or static product poster was unavailable');
  }
  const fallbackFile = path.join(outputDir, 'fallback-p8.png');
  await fallback.screenshot({ path: fallbackFile });
  report.push({ viewport: 'fallback', chapter: 'p8', posterVisible, filename: fallbackFile });
  await fallback.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));

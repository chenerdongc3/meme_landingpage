# Me Smooth Three.js Chapter Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove chapter cue labels such as `P1 · 开场` while preserving all story content, and replace discrete Three.js chapter jumps with deterministic continuous whole-product motion.

**Architecture:** `story-timeline.js` remains the single source of truth and gains a pure `deriveScenePose(progress)` function that interpolates product-rig keyframes around chapter boundaries. `me-scene.js` adds a parent rig around the existing product root, applies the continuous pose to that rig, and leaves part/narrative animation in `me-product.js` unchanged.

**Tech Stack:** Semantic HTML, Tailwind-free existing CSS, vanilla ES modules, Three.js 0.185.1, Node test runner, Python unittest, Playwright/Chromium.

## Global Constraints

- Preserve all P1, P2, P3, P4, P7, and P8 headings, body copy, data attributes, and Three.js narrative beats.
- Remove every visible chapter cue label matching `P# · 名称`; do not remove the chapter counter or progress rail.
- Keep `deriveStoryState(progress)` deterministic so forward scroll, reverse scroll, and `renderAt(progress)` produce the same frame state.
- Use no new dependency, backend API, UI component, CSS preprocessor, or inline-style system.
- Scale down whole-product displacement on mobile and under `prefers-reduced-motion: reduce`.
- The workspace is not a Git repository, so commit steps are intentionally replaced by file and test verification.

---

### Task 1: Remove Chapter Cue Labels Without Removing Story Content

**Files:**
- Modify: `tests/test_structure.py`
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: existing six `[data-chapter]` articles and chapter copy.
- Produces: the same six story chapters with no `.chapter-index` elements or `P# · 名称` cue strings.

- [ ] **Step 1: Add a failing structural test**

Add this method to `StructureTests` in `tests/test_structure.py`:

```python
def test_chapter_cue_labels_are_removed_without_removing_chapters(self):
    self.assertNotIn('class="chapter-index"', self.html)
    for cue in [
        "P1 · 开场",
        "P2 · 立场",
        "P3 · 主旨一",
        "P4 · 主旨二",
        "P7 · 升华",
        "P8 · 收尾",
    ]:
        self.assertNotIn(cue, self.html)
    chapters = re.findall(r'data-chapter="(p\d+)"', self.html)
    self.assertEqual(chapters, ["p1", "p2", "p3", "p4", "p7", "p8"])
```

- [ ] **Step 2: Run the test and verify the current labels fail it**

Run: `python3 -m unittest tests.test_structure.StructureTests.test_chapter_cue_labels_are_removed_without_removing_chapters -v`

Expected: FAIL because `class="chapter-index"` and the six cue strings still exist.

- [ ] **Step 3: Remove only the cue-label markup and unused selectors**

Delete the six `<p class="chapter-index">…</p>` elements from `index.html`. In `styles.css`, delete the base `.chapter-index { … }` block and the mobile `.chapter-index { … }` rule. Change the alert selector from:

```css
.chapter--alert .chapter-index,
.chapter--alert h2 {
```

to:

```css
.chapter--alert h2 {
```

- [ ] **Step 4: Verify labels are absent and story structure still passes**

Run: `python3 -m unittest tests/test_structure.py -v`

Expected: all structure tests PASS, including six ordered chapters, one `h1`, five `h2` elements, and all supplied core copy.

---

### Task 2: Derive a Continuous Whole-Product Pose From Scroll Progress

**Files:**
- Modify: `tests/test_timeline.js`
- Modify: `story-timeline.js`

**Interfaces:**
- Produces: `deriveScenePose(progress): { sceneX: number, sceneY: number, sceneZ: number, sceneYaw: number }`.
- Extends: `deriveStoryState(progress)` with the same four finite pose fields.
- Consumes: existing normalized scroll progress and chapter boundaries.

- [ ] **Step 1: Add failing pose and continuity tests**

Import `deriveScenePose` and add these tests to `tests/test_timeline.js`:

```js
test('scene pose changes continuously around every chapter boundary', () => {
  for (const boundary of [0.14, 0.31, 0.49, 0.66, 0.84]) {
    const before = deriveScenePose(boundary - 0.0001);
    const after = deriveScenePose(boundary + 0.0001);
    for (const key of ['sceneX', 'sceneY', 'sceneZ', 'sceneYaw']) {
      assert.ok(Number.isFinite(before[key]));
      assert.ok(Number.isFinite(after[key]));
      assert.ok(Math.abs(after[key] - before[key]) < 0.03, `${key} jumped at ${boundary}`);
    }
  }
});

test('scene pose provides lateral, depth, vertical, and yaw movement', () => {
  const samples = [0.07, 0.225, 0.40, 0.575, 0.75, 0.93].map(deriveScenePose);
  for (const key of ['sceneX', 'sceneY', 'sceneZ', 'sceneYaw']) {
    const values = samples.map((pose) => pose[key]);
    assert.ok(Math.max(...values) - Math.min(...values) > 0.08, `${key} did not move`);
  }
});

test('story state exposes the deterministic scene pose', () => {
  for (const progress of [0, 0.14, 0.31, 0.49, 0.66, 0.84, 1]) {
    const state = deriveStoryState(progress);
    assert.deepEqual(
      Object.fromEntries(['sceneX', 'sceneY', 'sceneZ', 'sceneYaw'].map((key) => [key, state[key]])),
      deriveScenePose(progress),
    );
  }
});
```

- [ ] **Step 2: Run the timeline suite and verify it fails for the missing export**

Run: `node --test tests/test_timeline.js`

Expected: FAIL because `deriveScenePose` is not exported.

- [ ] **Step 3: Implement keyframes and smooth boundary interpolation**

Add canonical desktop pose data to `story-timeline.js`:

```js
const SCENE_POSES = Object.freeze({
  p1: Object.freeze({ sceneX: 0, sceneY: 0, sceneZ: 0.10, sceneYaw: 0 }),
  p2: Object.freeze({ sceneX: 2.2, sceneY: 0.10, sceneZ: 0.35, sceneYaw: -0.10 }),
  p3: Object.freeze({ sceneX: -2.0, sceneY: 0.18, sceneZ: -0.35, sceneYaw: 0.14 }),
  p4: Object.freeze({ sceneX: 2.1, sceneY: -0.10, sceneZ: 0.30, sceneYaw: -0.12 }),
  p7: Object.freeze({ sceneX: -2.0, sceneY: 0.16, sceneZ: -0.30, sceneYaw: 0.11 }),
  p8: Object.freeze({ sceneX: 0, sceneY: 0.02, sceneZ: 0.16, sceneYaw: 0 }),
});

const POSE_FIELDS = Object.freeze(['sceneX', 'sceneY', 'sceneZ', 'sceneYaw']);
const TRANSITION_HALF_WIDTH = 0.035;
```

Implement a field-wise interpolator and a pure boundary-window pose function:

```js
function mixPose(from, to, amount) {
  return Object.fromEntries(
    POSE_FIELDS.map((key) => [key, from[key] + (to[key] - from[key]) * amount]),
  );
}

export function deriveScenePose(rawProgress) {
  const progress = clamp01(rawProgress);
  let pose = SCENE_POSES[CHAPTERS[0].id];
  for (let index = 1; index < CHAPTERS.length; index += 1) {
    const boundary = CHAPTERS[index].start;
    const nextPose = SCENE_POSES[CHAPTERS[index].id];
    const start = boundary - TRANSITION_HALF_WIDTH;
    const end = boundary + TRANSITION_HALF_WIDTH;
    if (progress <= start) return { ...pose };
    if (progress < end) {
      return mixPose(pose, nextPose, smoothstep(rangeProgress(progress, start, end)));
    }
    pose = nextPose;
  }
  return { ...pose };
}
```

Spread the pose into the existing `deriveStoryState()` return object:

```js
return {
  progress,
  chapter: chapter.id,
  chapterIndex: CHAPTERS.indexOf(chapter),
  chapterProgress,
  ...deriveScenePose(progress),
  open: smoothstep(rangeProgress(progress, 0.22, 0.38))
    * (1 - smoothstep(rangeProgress(progress, 0.64, 0.80))),
  meme: enterExit(progress, 0.34, 0.42, 0.47, 0.50),
  refusal: enterExit(progress, 0.50, 0.55, 0.63, 0.68),
  task: enterExit(progress, 0.53, 0.60, 0.65, 0.70),
  archive: enterExit(progress, 0.67, 0.76, 0.84, 0.90),
  tear: smoothstep(rangeProgress(progress, 0.86, 0.99)),
  finalMe: smoothstep(rangeProgress(progress, 0.95, 0.99)),
};
```

- [ ] **Step 4: Run timeline and product tests**

Run: `npm test`

Expected: all timeline and product-model tests PASS; existing narrative fields remain unchanged.

---

### Task 3: Apply the Continuous Pose Through a Dedicated Three.js Rig

**Files:**
- Modify: `tests/test_structure.py`
- Modify: `me-scene.js`

**Interfaces:**
- Consumes: `state.sceneX`, `state.sceneY`, `state.sceneZ`, and `state.sceneYaw` from `deriveStoryState()`.
- Produces: a `product-rig` parent group whose transform is continuous and independent of the product's part animation.

- [ ] **Step 1: Add a failing scene-integration source test**

Add this method to `StructureTests`:

```python
def test_scene_consumes_continuous_pose_without_chapter_position_map(self):
    scene = (ROOT / "me-scene.js").read_text(encoding="utf-8")
    self.assertIn("product-rig", scene)
    self.assertIn("state.sceneX", scene)
    self.assertIn("state.sceneY", scene)
    self.assertIn("state.sceneZ", scene)
    self.assertIn("state.sceneYaw", scene)
    self.assertNotIn("chapterX", scene)
```

- [ ] **Step 2: Run the focused structural test and verify it fails**

Run: `python3 -m unittest tests.test_structure.StructureTests.test_scene_consumes_continuous_pose_without_chapter_position_map -v`

Expected: FAIL because `me-scene.js` still contains `chapterX` and no product rig.

- [ ] **Step 3: Add the rig and remove discrete chapter positioning**

Replace direct scene attachment:

```js
const product = createMeProduct(THREE);
const productRig = new THREE.Group();
productRig.name = 'product-rig';
productRig.add(product.root);
scene.add(productRig);
```

Extend the local default state with zero-valued pose fields. Delete the complete `chapterX` object. After `applyProductState()` in `render()`, apply responsive motion scales:

```js
const lateralScale = compact ? 0.34 : reducedMotion ? 0.42 : 1;
const motionScale = reducedMotion ? 0.32 : 1;
productRig.position.set(
  state.sceneX * lateralScale,
  state.sceneY * motionScale,
  state.sceneZ * (compact ? 0.52 : motionScale),
);
productRig.rotation.y = state.sceneYaw * motionScale;
```

Keep pointer input and the existing narrative rotation on `product.root`; do not overwrite `product.root.position.y` because `applyProductState()` uses it for ambient floating.

- [ ] **Step 4: Run integration, syntax, and unit tests**

Run:

```bash
python3 -m unittest tests/test_structure.py -v
npm test
node --check me-scene.js story-timeline.js app.js me-product.js
```

Expected: all commands PASS and `rg -n "chapterX|chapter-index|P[123478] ·" index.html styles.css me-scene.js` returns no matches.

---

### Task 4: Browser Verification at Chapter Centers and Boundaries

**Files:**
- Modify: `capture_scroll.js`
- Update generated files: `test-artifacts/threejs/*.png`
- Update generated files: `preview/threejs/*.png`

**Interfaces:**
- Consumes: `window.__ME_STORY__.renderAt(progress)` and the four pose fields on `window.__ME_STORY__.state`.
- Produces: passing desktop/mobile/reduced-motion/fallback checks plus transition-boundary screenshots.

- [ ] **Step 1: Add browser assertions for cue removal and finite continuous pose**

After WebGL readiness in each viewport, assert no cue element exists:

```js
const cueCount = await page.locator('.chapter-index').count();
if (cueCount !== 0) throw new Error(`${viewport.name}: chapter cue labels remain`);
```

For desktop, sample each boundary at `boundary - 0.0001` and `boundary + 0.0001`, compare the four state fields, and require every delta to remain below `0.03`:

```js
for (const boundary of [0.14, 0.31, 0.49, 0.66, 0.84]) {
  const [before, after] = await page.evaluate((value) => {
    const fields = ['sceneX', 'sceneY', 'sceneZ', 'sceneYaw'];
    const pick = (state) => Object.fromEntries(fields.map((key) => [key, state[key]]));
    return [pick(window.__ME_STORY__.renderAt(value - 0.0001)), pick(window.__ME_STORY__.renderAt(value + 0.0001))];
  }, boundary);
  for (const key of ['sceneX', 'sceneY', 'sceneZ', 'sceneYaw']) {
    if (!Number.isFinite(before[key]) || !Number.isFinite(after[key]) || Math.abs(after[key] - before[key]) >= 0.03) {
      throw new Error(`desktop: ${key} jumped at ${boundary}`);
    }
  }
}
```

- [ ] **Step 2: Capture transition-center frames for visual review**

For the desktop viewport, render each exact boundary and save:

```js
for (const [name, progress] of [
  ['p1-p2', 0.14],
  ['p2-p3', 0.31],
  ['p3-p4', 0.49],
  ['p4-p7', 0.66],
  ['p7-p8', 0.84],
]) {
  await page.evaluate((value) => window.__ME_STORY__.renderAt(value), progress);
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outputDir, `desktop-transition-${name}.png`) });
}
```

- [ ] **Step 3: Run the complete smoke suite**

Run: `npm run smoke`

Expected: structure, timeline, product, syntax, server, WebGL, overflow, cue-removal, pose-continuity, reduced-motion, fallback, and screenshot checks all PASS.

- [ ] **Step 4: Inspect representative rendered artifacts**

Inspect these images at full size:

- `test-artifacts/threejs/desktop-transition-p2-p3.png`
- `test-artifacts/threejs/desktop-transition-p3-p4.png`
- `test-artifacts/threejs/mobile-p3.png`
- `test-artifacts/threejs/reduced-p3.png`

Acceptance checks: the product remains inside the visual stage, is not clipped by the viewport, stays paired with readable copy, and shows an in-between whole-product translation/turn rather than a discrete side swap.

- [ ] **Step 5: Refresh preview artifacts and rerun smoke verification**

Run:

```bash
BASE_URL="http://127.0.0.1:8877/index.html" OUTPUT_DIR="preview/threejs" node capture_scroll.js
npm run smoke
```

Start the local HTTP server on port `8877` before the first command and stop it before running `npm run smoke`, which uses port `8899`. Expected: preview images refresh and the final smoke run prints `Smoke verification passed.`

---

### Task 5: Requirement-by-Requirement Completion Audit

**Files:**
- Inspect: `index.html`, `styles.css`, `story-timeline.js`, `me-scene.js`, tests, and generated screenshots.

**Interfaces:**
- Consumes: implementation and verification outputs from Tasks 1–4.
- Produces: evidence that every requested behavior is complete.

- [ ] **Step 1: Audit cue-label removal against the rendered source**

Run: `rg -n "chapter-index|P1 · 开场|P2 · 立场|P3 · 主旨一|P4 · 主旨二|P7 · 升华|P8 · 收尾" index.html styles.css`

Expected: no matches.

- [ ] **Step 2: Audit preservation of all chapters and story copy**

Run: `python3 -m unittest tests.test_structure.StructureTests.test_story_has_six_ordered_chapters tests.test_structure.StructureTests.test_supplied_headings_and_core_copy_are_present -v`

Expected: both tests PASS.

- [ ] **Step 3: Audit continuous Three.js motion from source, pure state, and browser evidence**

Run:

```bash
node --test tests/test_timeline.js
python3 -m unittest tests.test_structure.StructureTests.test_scene_consumes_continuous_pose_without_chapter_position_map -v
npm run smoke
```

Expected: all commands PASS; source has no discrete `chapterX` map, pure state is continuous at every boundary, and browser checks see no cue labels or pose jumps.

- [ ] **Step 4: Record the workspace limitation**

Run: `git rev-parse --is-inside-work-tree`

Expected: failure with `not a git repository`; report that no commit was created without treating it as an implementation failure.

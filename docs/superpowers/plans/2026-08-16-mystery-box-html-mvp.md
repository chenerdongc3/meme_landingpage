# Mystery Box HTML MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained, no-build landing-page prototype that communicates the mystery-box interaction through scroll-driven pseudo-3D animation and a receipt-printing payoff.

**Architecture:** Use semantic DOM for all copy and controls, CSS transforms for the pseudo-3D product and exploded parts, and a single native-JavaScript `ScrollController` that maps page scroll position to normalized progress. Keep animation state derived from progress so the eventual GLB/Three.js upgrade can reuse the same timeline.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Node.js syntax checks, Python standard-library smoke tests, headless Chromium visual verification.

## Global Constraints

- No build step or external runtime dependency for v1.
- The prototype must open from `index.html` locally and also work from a trivial static server.
- The scroll position is the single source of truth for the main animation.
- Pointer tilt is decorative desktop-only behavior and must not fight the scroll timeline.
- Mobile product width stays within roughly 70–80% of the viewport.
- `prefers-reduced-motion: reduce` must disable floating and substantially reduce large movements.
- All user-facing text stays as semantic DOM text; decorative product parts use `aria-hidden`.
- Prefer transforms and opacity over layout-changing animation properties.

---

### Task 1: Semantic page skeleton and static contract

**Files:**
- Create: `index.html`
- Create: `tests/test_structure.py`

**Interfaces:**
- Consumes: approved design spec copy and scene order.
- Produces: stable element IDs/classes consumed by CSS and `app.js`: `#productStage`, `#mysteryBox`, `#receipt`, `#storyCopy`, `#askAgain`, and `[data-part]` internals.

- [ ] **Step 1: Write failing structure tests** checking semantic heading, product-stage hooks, internal-part hooks, receipt, CTA, stylesheet and script references.
- [ ] **Step 2: Run `python3 -m unittest tests/test_structure.py -v`** and confirm it fails because `index.html` does not yet exist.
- [ ] **Step 3: Create minimal semantic `index.html`** with the full story copy and all animation hooks.
- [ ] **Step 4: Re-run the structure test** and confirm it passes.
- [ ] **Step 5: Commit** `test: define mystery box page structure` and `feat: add semantic landing page skeleton` together as one independently testable change.

### Task 2: Pseudo-3D product and responsive visual system

**Files:**
- Create: `styles.css`
- Modify: `tests/test_structure.py`

**Interfaces:**
- Consumes: stable DOM hooks from Task 1.
- Produces: CSS custom properties driven later by JavaScript: `--progress`, `--explode`, `--reassemble`, `--tap`, `--wake`, `--print`, `--tilt-x`, `--tilt-y`.

- [ ] **Step 1: Extend tests** to assert required CSS variable names, perspective stage, reduced-motion media query, responsive media query, and all visual part selectors.
- [ ] **Step 2: Run tests** and confirm the CSS assertions fail.
- [ ] **Step 3: Implement `styles.css`** for the warm-white environment, cube shell, question marks, screws, red button, simplified internals, labels, receipt, responsive layout, and reduced motion.
- [ ] **Step 4: Re-run tests** and confirm they pass.
- [ ] **Step 5: Commit** `feat: build pseudo 3d mystery box visuals`.

### Task 3: Normalized scroll controller and interaction timeline

**Files:**
- Create: `app.js`
- Create: `tests/test_timeline.js`

**Interfaces:**
- Produces pure helpers `clamp01(value)`, `rangeProgress(value, start, end)`, and `deriveTimeline(progress)`.
- `deriveTimeline(progress)` returns `{ hero, tap, explode, wake, reassemble, print, final }`, each normalized to `0..1`.
- Browser controller writes derived values to CSS variables on `#productStage` and updates scene copy accessibility state.

- [ ] **Step 1: Write failing Node tests** for clamping, segment mapping, and key timeline checkpoints at 0, .2, .45, .67, .8, and .95.
- [ ] **Step 2: Run `node --test tests/test_timeline.js`** and confirm it fails because `app.js` is missing.
- [ ] **Step 3: Implement pure timeline helpers plus browser-only controller initialization** using `requestAnimationFrame` and no dependency on layout reads during each frame.
- [ ] **Step 4: Run `node --test tests/test_timeline.js` and `node --check app.js`** and confirm both pass.
- [ ] **Step 5: Commit** `feat: add scroll driven animation timeline`.

### Task 4: Pointer tilt, replay behavior, and progressive polish

**Files:**
- Modify: `app.js`
- Modify: `styles.css`
- Modify: `tests/test_timeline.js`

**Interfaces:**
- Desktop pointer input only updates `--tilt-x` and `--tilt-y` when timeline progress is below the exploded section.
- `#askAgain` scrolls the page to the top with smooth behavior unless reduced motion is preferred.

- [ ] **Step 1: Add tests** for the helper that gates pointer tilt and for replay target behavior where practical.
- [ ] **Step 2: Run Node tests** and confirm the new helper test fails.
- [ ] **Step 3: Implement pointer tilt, resize-safe scroll updates, replay button, and small staged copy transitions.**
- [ ] **Step 4: Run all static and Node tests.**
- [ ] **Step 5: Commit** `feat: add responsive product interactions`.

### Task 5: Documentation and browser verification

**Files:**
- Create: `README.md`
- Create: `tests/smoke.sh`

**Interfaces:**
- `tests/smoke.sh` starts `python3 -m http.server` on a local port, fetches the page, runs syntax/tests, and launches headless Chromium for a rendered screenshot.
- README documents local opening, static-server option, editable sections, and the later GLB replacement path.

- [ ] **Step 1: Create smoke verification script** that runs Python tests, Node tests, JavaScript syntax check, serves files, curls the page, and renders a Chromium screenshot.
- [ ] **Step 2: Run the smoke script** and inspect failures or browser console/output.
- [ ] **Step 3: Fix any rendering or contract issues found by smoke verification.**
- [ ] **Step 4: Write README** with operation and upgrade instructions.
- [ ] **Step 5: Run final verification**, inspect the screenshot at desktop and mobile sizes, check git status/diff, and commit `docs: package mystery box html prototype`.

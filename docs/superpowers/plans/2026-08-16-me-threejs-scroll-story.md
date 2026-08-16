# Me Three.js Scroll Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CSS pseudo-3D mystery box with a real Three.js product and pair six supplied Chinese chapters with distinct scroll-driven visual highlights.

**Architecture:** Split the static site into semantic HTML, a pure ES-module story timeline, a procedural Three.js product factory, a scene renderer, and a small DOM/scroll controller. `deriveStoryState(progress)` is the single narrative state source consumed by both DOM copy and WebGL.

**Tech Stack:** HTML5, CSS3, vanilla ES modules, vendored Three.js, Node test runner, Python structural tests, Playwright/Chromium screenshots.

## Global Constraints

- Keep the site static; do not add backend calls or pretend P7 uses live storage.
- Render all narrative copy as semantic HTML, never as WebGL text.
- Do not explain `MeMe → Me` before P8.
- Use the supplied P1, P2, P3, P4, P7, and P8 copy in that order.
- Preserve a readable CSS fallback if WebGL or module loading fails.
- Cap pixel ratio and model complexity on mobile; preserve reduced-motion behavior.
- This directory has no Git metadata, so commit steps are recorded but skipped unless a repository appears.

---

### Task 1: Six-Chapter Semantic Story

**Files:**
- Modify: `tests/test_structure.py`
- Replace: `index.html`

**Interfaces:**
- Produces six `[data-chapter]` sections with values `p1`, `p2`, `p3`, `p4`, `p7`, `p8`.
- Produces `#webglStage`, `#webglCanvas`, `#productPoster`, `#storyProgress`, and `#webglStatus` hooks.

- [ ] Write failing structure assertions for all six chapters, exact headings, core body phrases, module script, canvas, poster, and the absence of waitlist copy.
- [ ] Run `python3 -m unittest tests/test_structure.py -v`; verify failures report missing chapter and WebGL hooks.
- [ ] Replace `index.html` with one `h1` in P1, five `h2` headings, exact supplied paragraphs, a decorative canvas, fallback poster, and progress rail.
- [ ] Run the structure test and verify it passes.
- [ ] Skip commit because this workspace is not a Git repository.

### Task 2: Pure Six-Chapter Timeline

**Files:**
- Replace: `tests/test_timeline.js`
- Create: `story-timeline.js`

**Interfaces:**
- Produces `clamp01(number): number`, `rangeProgress(number, number, number): number`, `smoothstep(number): number`, and `deriveStoryState(number): StoryState`.
- `StoryState` contains `progress`, `chapter`, `chapterProgress`, `open`, `refusal`, `meme`, `archive`, `tear`, and `finalMe`, each continuous numeric field clamped to `0..1`.

- [ ] Write Node tests for chapter boundaries `[0,.14,.31,.49,.66,.84,1]`, clamping, and representative P3/P4/P7/P8 visual states.
- [ ] Run `node --test tests/test_timeline.js`; verify it fails because `story-timeline.js` does not exist.
- [ ] Implement the pure helpers and derived state with explicit segment interpolation.
- [ ] Run the timeline tests and verify they pass.
- [ ] Skip commit because this workspace is not a Git repository.

### Task 3: Procedural Three.js Product

**Files:**
- Create: `vendor/three.module.min.js`
- Create: `tests/test_product_model.js`
- Create: `me-product.js`

**Interfaces:**
- Produces `createMeProduct(THREE): { root, parts, materials, dispose }`.
- Named `parts` include `shellFront`, `shellBack`, `shellLeft`, `shellRight`, `shellTop`, `shellBottom`, `printer`, `paperRoll`, `pcb`, `battery`, `button`, `receipt`, `taskCard`, `book`, and `tearHalf`.
- Produces `applyProductState(product, state, time, compact): void`.

- [ ] Vendor a pinned Three.js ES module into `vendor/` and record its license.
- [ ] Write a failing Node model test that imports Three.js and expects every named mesh/group, bevel-capable geometry, finite bounding boxes, and distinct exploded transforms.
- [ ] Run `node --test tests/test_product_model.js`; verify it fails because `me-product.js` does not exist.
- [ ] Implement shared materials, rounded extruded boxes, panels with thickness, screws, question marks, printer internals, paper, task card, question book, and tear half.
- [ ] Implement state application with staggered non-intersecting axes and chapter-specific visibility.
- [ ] Run product and timeline tests and verify they pass.
- [ ] Skip commit because this workspace is not a Git repository.

### Task 4: WebGL Scene and DOM Controller

**Files:**
- Create: `me-scene.js`
- Replace: `app.js`
- Replace: `styles.css`
- Modify: `tests/test_structure.py`

**Interfaces:**
- `createMeScene(canvas, options)` returns `{ setState, setPointer, resize, render, dispose }`.
- `app.js` owns scroll measurement, selects `[data-chapter]`, calls `deriveStoryState`, updates progress, and forwards state to the scene.
- The document root receives `webgl-ready`, `webgl-fallback`, and `reduced-motion` classes.

- [ ] Extend structural tests for responsive CSS, reduced-motion CSS, fallback classes, full-height story range, and `type="module"`.
- [ ] Run the structure test and verify the new assertions fail.
- [ ] Implement the scene with perspective camera, key/fill/rim lights, contact-shadow plane, capped pixel ratio, transparent renderer, resize handling, and context-failure fallback.
- [ ] Implement the scroll controller and pointer easing without independent narrative state.
- [ ] Implement the complete responsive visual system and chapter transitions in `styles.css`.
- [ ] Run all unit/static tests plus `node --check app.js me-scene.js me-product.js story-timeline.js`.
- [ ] Skip commit because this workspace is not a Git repository.

### Task 5: Browser Verification and Polish

**Files:**
- Replace: `capture_scroll.js`
- Modify: `tests/smoke.sh`
- Modify: `README.md`
- Create: `preview/threejs-*.png`

**Interfaces:**
- Capture script accepts desktop/mobile viewport definitions and records midpoint screenshots for all six chapters.
- Smoke script runs structure, timeline, product, syntax, server, browser-console, overflow, and screenshot checks.

- [ ] Update the capture script to visit the six midpoint progresses and fail on page errors, WebGL fallback, clipped active copy, or horizontal overflow.
- [ ] Run `./tests/smoke.sh`; if a bug appears, first add a failing regression assertion before changing production code.
- [ ] Inspect all twelve chapter captures and refine camera framing, explosion distance, copy width, shadows, and mobile scale.
- [ ] Update README with the Three.js architecture, local-server requirement, chapter map, fallback behavior, and verification commands.
- [ ] Run the complete smoke suite again and record fresh passing output.
- [ ] Skip commit because this workspace is not a Git repository.

### Task 6: Requirement-by-Requirement Completion Audit

**Files:**
- Inspect all implementation and preview artifacts.

- [ ] Verify each exact supplied chapter heading and paragraph in the rendered DOM.
- [ ] Verify P1 has no name explanation and P8 alone performs the `MeMe → Me` reveal.
- [ ] Verify P3 image-meme, P4 refusal/task card, P7 question book, and P8 tear states from browser captures.
- [ ] Verify model thickness, lighting, shadows, exploded separation, and lack of visible solid intersections at authored checkpoints.
- [ ] Verify desktop, mobile, reduced-motion, and WebGL-fallback story completeness.
- [ ] Run the full verification command immediately before reporting completion.

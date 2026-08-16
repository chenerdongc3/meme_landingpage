# Me — Three.js Scroll Story

A static, scroll-driven product story for `Me`: a playful physical toy that values questions, interpretation, and action over chatbot answers.

The product is now a real Three.js assembly rather than stacked CSS planes. Its rounded enclosure, screws, paper path, printer, PCB, battery, button, task card, question book, and tear-away receipt are independent meshes animated from one normalized scroll timeline.

## Run locally

ES modules require an HTTP server. Two options:

```bash
# 方式一:Node(推荐,与测试工具链统一)
npm start

# 方式二:Python(无需额外安装)
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/index.html`.

## Story chapters

| Range | Chapter | Visual highlight |
| --- | --- | --- |
| 0–14% | P1 · 开场 | Assembled toy and two “not a chatbot” annotations; the name stays unexplained |
| 14–31% | P2 · 立场 | Tactile hardware stance and first enclosure movement |
| 31–49% | P3 · 主旨一 | Staggered exploded view and image-only meme receipt |
| 49–66% | P4 · 主旨二 | Red refusal state and 地球 Online To Do card |
| 66–84% | P7 · 升华 | Reassembly plus the floating 问题之书 |
| 84–100% | P8 · 收尾 | `MeMe` receipt tears down to `Me` |

## Conversion optimisation

The page follows the [landing-page-generator SKILL](https://github.com/borghei/Claude-Skills/blob/main/marketing/landing-page-generator/SKILL.md) checklist:

- **Single conversion goal** — one primary CTA (预约首批体验 / reserve first batch) drives every chapter toward the waitlist form.
- **Above-the-fold CTA** — the hero chapter (P1) contains a visible CTA button on both desktop and mobile.
- **CTAs throughout the story** — chapters P2, P7, and P8 each carry a contextual CTA linking to `#waitlist`.
- **Risk reversal** — every CTA and the form itself include risk-reversal copy (无需付费 · 仅留邮箱 · 随时退订).
- **Social proof** — a three-item proof bar (sign-ups, limited first batch, zero deposit) sits beside the form.
- **FAQ** — five collapsible FAQ items handle top objections (what is Me, how is it different, what is 问题之书, do I pay to reserve, when do I get it).
- **Final CTA** — the conversion section ends with the form and a repeated ask.
- **SEO meta** — Open Graph, Twitter Card, canonical, keywords, and Product schema (JSON-LD) are all present.
- **No navigation** — the page has no header nav, sidebar, or footer link maze; the only exit path is the conversion form.
- **Mobile first** — the hero CTA and all chapter CTAs are visible and tappable at 375px.

The 3D scroll story remains the primary visual experience. The conversion section appears as a natural continuation after the story ends, not as an interruption.

## Conversion section

The `#waitlist` section below the scroll story contains:

- a single-field email capture form (`#reserveForm`);
- a social-proof bar;
- five FAQ items;
- a footer with contact email.

Form submission is handled in `app.js` with client-side validation, a success state, and localStorage-based sign-up persistence. The sign-up count is displayed in the proof bar.

## Architecture

- `index.html` — semantic Chinese story and CSS fallback poster
- `styles.css` — responsive layout, typography, fallback, and reduced-motion presentation
- `story-timeline.js` — pure six-chapter state derivation
- `me-product.js` — procedural Three.js model and part animation
- `me-scene.js` — renderer, camera, studio lighting, shadows, and resize behavior
- `app.js` — scroll measurement and shared DOM/WebGL state
- `vendor/` — pinned Three.js 0.185.1 runtime and license
- `capture_scroll.js` — desktop, mobile, reduced-motion, and WebGL-fallback browser captures

`deriveStoryState(progress)` is the single narrative source of truth. The DOM controller and Three.js scene consume the same result; the model never reads `window.scrollY`.

## Fallback and performance

The CSS product poster remains visible until the first WebGL frame. If WebGL initialization or context creation fails, the canvas is removed while the poster and all six HTML chapters continue to work.

Mobile mode caps device pixel ratio, disables expensive shadows, reduces model scale and explosion distance, and stacks the active copy beneath the product. `prefers-reduced-motion: reduce` removes pointer motion and ambient floating while preserving every chapter state.

## Verify

Install the browser-test dependency once:

```bash
npm install
```

Run unit and model tests:

```bash
npm test
```

Run the complete static-server and browser suite:

```bash
npm run smoke
```

The smoke suite verifies:

- exact six-chapter order and core supplied copy;
- pure timeline boundaries;
- physical part names, geometry thickness, and exploded axes;
- JavaScript syntax;
- successful real WebGL rendering;
- all six desktop and mobile chapter captures;
- no horizontal overflow or clipped active copy;
- reduced-motion P3/P8 states;
- static-poster fallback with P8 copy still available.

Artifacts are written to `test-artifacts/threejs/`.

## Model tuning

Change narrative timing only in `story-timeline.js`. Change part construction and exploded trajectories in `me-product.js`. Change camera distance, chapter framing, light intensity, and performance caps in `me-scene.js`.

The implementation is procedural because no production CAD/GLB asset is available. A later GLB can replace `createMeProduct()` while keeping `deriveStoryState()` and the semantic story unchanged.

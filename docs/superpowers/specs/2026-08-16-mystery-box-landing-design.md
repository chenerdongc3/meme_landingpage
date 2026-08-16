# Mystery Box Landing Page — Design Spec

Date: 2026-08-16
Status: Approved and implemented as HTML MVP

## 1. Goal

Create a high-fidelity landing-page prototype for the yellow question-mark toy shown in the reference images, starting from zero production assets. The prototype must communicate the product interaction without requiring a finished CAD/Blender model.

Primary story:

1. The box floats in a calm hero scene.
2. The user scrolls toward the red bottom button and “taps” it.
3. The box wakes up with a subtle light response.
4. The shell explodes into layers to reveal a simplified internal thermal-printer system.
5. Internal parts are explained with minimal copy.
6. The parts return into the enclosure.
7. A receipt prints from the top with a playful answer.
8. The page ends on a simple “Ask again / See how it works” CTA.

The first version is a visual/interaction prototype, not an engineering-accurate representation of the internals.

## 2. Recommended Deliverable

Deliver a self-contained prototype folder:

- `index.html` — main page
- `styles.css` — layout, materials, responsive behavior
- `app.js` — scroll timeline and interactions
- `assets/` — lightweight local SVG/PNG assets derived from the supplied references where appropriate
- `README.md` — how to open, edit, and later replace the fake 3D object with a real GLB model

No build step is required for v1. It should open locally in a modern browser.

## 3. Visual Direction

### Overall

- Premium playful hardware aesthetic
- Mostly white / warm-light-gray environment
- Strong yellow enclosure as the visual anchor
- Dark gray typography
- Red bottom button as the interaction accent
- Soft studio shadows rather than “gaming” glow
- Minimal UI and minimal text

### Product Model for V1

Use a CSS/DOM pseudo-3D construction instead of a real GLB model.

The enclosure should visually resemble the reference:

- yellow cube-like housing
- large white question mark on visible faces
- small dark screws / corner details
- red circular button underneath
- white thermal paper emerging from the top

The pseudo-3D object is composed of independently animatable layers so that it can behave like an exploded product diagram.

## 4. Page Storyboard

### Scene 1 — Hero / 0–15% scroll

Viewport is nearly empty except for the floating box.

Copy:

- “ASK THE BOX.”
- “Don’t overthink it.”

Motion:

- very slow floating
- slight pointer-based tilt on desktop
- no pointer interaction required on mobile

### Scene 2 — Tap / 15–28%

Camera illusion moves closer to the bottom of the box.

- red button compresses
- box makes a tiny rebound
- internal light pulses once
- copy changes to “Ask anything.”

### Scene 3 — Exploded View / 28–62%

The page pins while the user continues scrolling.

Shell layers separate gradually:

- top shell moves upward
- left/right/front shell move outward
- bottom plate lowers slightly

Simplified internals become visible:

- paper roll
- thermal printer head/module
- PCB
- LED/light bar
- battery
- red button mechanism

Labels appear sequentially:

1. LISTEN — hears the question
2. THINK — chooses an answer
3. PRINT — makes the answer physical

The labels are conceptual, not technical specifications.

### Scene 4 — Wake / 62–72%

The internal LED illuminates briefly.

- very subtle surrounding light bloom
- printer paper twitches / advances slightly

This scene should feel like “the object is alive,” not like a sci-fi device.

### Scene 5 — Reassembly / 72–88%

All exploded parts reverse toward the center.

- labels fade
- shell closes
- box returns to a clean hero orientation

### Scene 6 — Print / 88–100%

A long receipt exits from the top.

Example receipt content for prototype only:

- small apple graphic
- “庆祝无意义！”

Final copy:

- “An answer you can hold.”
- CTA: “ASK AGAIN”

## 5. Interaction Model

The scroll position is the single source of truth.

A normalized progress value from `0` to `1` controls:

- product position
- pseudo-camera scale
- shell offsets
- rotations
- label opacity
- LED state
- paper length
- CTA appearance

Implementation should use native JavaScript + requestAnimationFrame for v1. No external animation library is required unless it materially simplifies the implementation.

Pointer movement only adds a small decorative tilt in the hero; it must never fight the scroll timeline.

## 6. Components / Responsibilities

### `ProductStage`

Owns the centered product visual and its perspective container.

Depends on:

- scroll progress
- viewport size

### `MysteryBox`

Owns all pseudo-3D shell faces and internal parts.

Public behavior:

- receives normalized progress
- derives shell positions and rotations from that value

### `Receipt`

Owns paper reveal and printed answer.

### `StoryCopy`

Owns the hero copy, exploded-view labels, and final CTA.

### `ScrollController`

Reads page scroll position, calculates normalized timeline progress, and schedules visual updates through `requestAnimationFrame`.

The visual components should not read `window.scrollY` directly.

## 7. Responsive Behavior

### Desktop

- full exploded view
- pointer tilt enabled
- larger spacing between components
- labels can sit around the object

### Mobile

- no pointer tilt
- exploded distances reduced
- labels stack closer to the center or below the product
- product stays within ~70–80% of viewport width
- paper remains readable without horizontal scrolling

### Reduced Motion

For `prefers-reduced-motion: reduce`:

- disable float / tilt
- reduce large exploded translations
- preserve scene changes using fades and smaller transforms

## 8. Performance Constraints

V1 should avoid heavy dependencies and large assets.

Targets:

- first prototype under ~1.5 MB where practical
- 60fps target on modern desktop
- visually stable on modern iPhone Safari
- transforms and opacity preferred over layout-changing properties
- no continuous expensive DOM measurement during scroll

## 9. Accessibility

- semantic heading structure
- text remains selectable and real DOM text
- CTA is a real button/link
- decorative product parts use `aria-hidden`
- page remains understandable if animations are reduced

## 10. Non-goals for V1

Do not build yet:

- real Three.js / React Three Fiber scene
- production Blender/CAD model
- real microphone interaction
- real AI inference
- real printer control
- checkout / commerce
- CMS
- analytics

These are intentionally excluded so the first prototype answers one question: **does the product story feel compelling when experienced as a scroll interaction?**

## 11. Upgrade Path to Real 3D

After the interaction is validated:

1. Model the enclosure and simplified internals in Blender/Fusion 360.
2. Export named parts as one GLB.
3. Replace the pseudo-3D `MysteryBox` with a Three.js / React Three Fiber scene.
4. Reuse the same normalized scroll timeline.
5. Keep all DOM copy and CTA structure unchanged.

Recommended GLB part naming:

- `shell_front`
- `shell_back`
- `shell_left`
- `shell_right`
- `shell_top`
- `shell_bottom`
- `printer`
- `paper_roll`
- `pcb`
- `battery`
- `led`
- `button`
- `receipt`

## 12. Acceptance Criteria

The v1 prototype is successful when:

- a user understands within ~5 seconds that the object is an interactive “answer box”
- scrolling visibly explains the interaction without requiring explanatory paragraphs
- the box clearly explodes into understandable internal layers
- the product closes again cleanly
- the receipt printing moment feels like the payoff of the page
- the prototype works by opening `index.html` locally
- the design remains convincing even though the first version uses pseudo-3D rather than a true model

## 13. Implementation Order

1. Build page skeleton and pinned scroll section.
2. Recreate the yellow mystery box as pseudo-3D layers.
3. Implement normalized scroll controller.
4. Add tap/button animation.
5. Add exploded-view internals.
6. Add reassembly.
7. Add receipt printing.
8. Add responsive and reduced-motion behavior.
9. Polish shadows, perspective, timing, and typography.
10. Package as a local prototype folder with README.


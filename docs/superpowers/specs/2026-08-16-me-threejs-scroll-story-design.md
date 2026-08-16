# Me Three.js Scroll Story — Design Spec

Date: 2026-08-16  
Status: Approved for implementation planning

## 1. Goal

Replace the current flat CSS pseudo-3D product with a materially convincing Three.js object and rebuild the page around the six supplied Chinese story chapters: P1, P2, P3, P4, P7, and P8.

The result must feel like a playful physical toy rather than an AI chatbot product. The name `Me` appears at the opening but its meaning is not explained until the final `MeMe → Me` reveal.

## 2. Scope and Constraints

- Keep the project as a static HTML/CSS/JavaScript site with no application backend.
- Use Three.js for the product, internal components, lighting, shadows, and scroll-driven object animation.
- Use real semantic HTML for all narrative copy; do not render body copy into WebGL.
- Model the product procedurally because no production CAD or GLB asset exists.
- Preserve one normalized scroll progress value as the animation source of truth.
- Do not invent or change product APIs. P7 describes the intended cloud history feature but this landing-page prototype does not implement storage.
- Keep styling in the existing stylesheet. No new CSS preprocessor or inline-style system is introduced.

## 3. Visual Direction

The visual language is a premium studio photograph of a deliberately oversized toy:

- warm off-white background;
- saturated yellow rounded plastic enclosure;
- white question marks and dark recessed screws;
- tactile red underside button;
- subtle seams, bevels, thickness, and contact shadows;
- restrained black typography with red used only for refusal/action states;
- soft key, fill, and rim lighting rather than neon or sci-fi effects.

The model must remain readable as one physical assembly. Exploded parts move along distinct axes and at staggered times; no two solid parts should visibly intersect at the authored chapter checkpoints.

## 4. Three.js Product Architecture

### Scene

`MeScene` owns the renderer, scene, camera, lighting, floor shadow, resize behavior, and animation loop. It exposes `render(progress, pointer)` and never reads page scroll directly.

### Product

`MeProduct` is a `THREE.Group` containing independently animated groups:

- enclosure frame and six rounded panels;
- four question-mark decals or shallow raised marks;
- recessed screws and panel seams;
- paper slot and internal paper path;
- paper roll and axle;
- thermal printer block and roller;
- PCB, chips, traces, and status light;
- battery and wiring accents;
- underside red button, collar, and spring;
- printable paper strip and tear-away half.

Rounded boxes use real beveled geometry rather than flat planes. Materials are reused across meshes to limit shader and texture cost.

### DOM Story Layer

`StoryController` owns the six HTML chapters, progress indicator, accessibility state, and reduced-motion behavior. Chapters remain readable without WebGL.

### Timeline

`deriveStoryState(progress)` is a pure function returning chapter-local progress plus model states such as rotation, explosion, printer advance, refusal, question-orbit visibility, and tear progress. Three.js receives this derived state; it does not make narrative decisions internally.

## 5. Six-Chapter Storyboard

### P1 · 开场 — 0% to 14%

Copy:

- `Me`
- `这是一台和 AI 没关系的大玩具`
- `不是 Chatbot 套壳！`
- `不是情绪陪伴硬件！`

Visual highlight:

- The assembled toy floats in a generous studio frame.
- Slow rotation reveals its four sides; the two negative statements appear around the object as physical annotation cards.
- The name is shown only as `Me`. No `MeMe` wordplay or explanation appears here.

### P2 · 立场 — 14% to 31%

Heading: `我们不想再做一个套壳的 Chatbot`

Body:

- `给答案、给情绪价值、发表观点，这件事任何一家大模型的情绪陪伴产品都做得了。`
- `作为硬件，它更接近玩具，更应该好玩。`
- `也应该相信人脑的主观能动性，相信人自己会联想。`

Visual highlight:

- A thin glass-like chatbot panel approaches the toy, then slides past without attaching.
- The toy responds with a small, playful button bounce and rotates toward the viewer.
- The enclosure begins opening just enough to show tangible mechanisms, establishing hardware and playfulness rather than a screen-based assistant.

### P3 · 主旨一 — 31% to 49%

Heading: `提问比答案更重要`

Body:

- `语言模型已经把观点发散变得易得，甚至廉价。`
- `但只有问出了对的问题，才有可能找到对的答案。`
- `所以这台机器输出的是什么，根本就不重要。`
- `我们选择图片 meme，是因为它有最低的信息密度，没有“稳稳接住你”的注解，剩下的交给人类自己去联想、去理解、去行动。`

Visual highlight:

- Shell panels separate in staggered directions, revealing paper roll, printer, PCB, battery, and button mechanism.
- A small image-only meme prints; no explanatory answer is attached.
- Oversized question marks remain visually dominant while any answer-like type fades away, reinforcing low information density and human interpretation.

### P4 · 主旨二 — 49% to 66%

Heading: `它会拒绝回答`

Body:

- `当 Me 识别到你反复困在同一个母题里，它会拒绝作出回答。`
- `这时候地球 Online 任务触发，你要完成一个 To Do，才可以接着对话和打印。`
- `是的，行动才是钻牛角尖的答案和解法。`

Visual highlight:

- Repeated question rings orbit inward and begin looping around the device.
- The printer stops, the status light turns restrained red, and the paper retracts slightly.
- The device prints a compact `地球 Online` task card with one clear `TO DO` checkbox. It is a narrative prop, not an interactive form.
- As the chapter exits, the checkbox marks complete and the red state releases.

### P7 · 升华 — 66% to 84%

Heading: `你问过什么，比你做过什么更像你`

Body:

- `我们搭建了后端系统，会云端储存提问过的问题，定期产出“问题之书”的报告。`
- `因而存下来的不是“我做了什么”，而是“我好奇什么、我困惑什么”。`
- `一个人反复在问的东西，可能就是他的天赋 / Calling 所在。`

Visual highlight:

- Small paper fragments carrying short question stems orbit the reassembling toy.
- The fragments align into the page edges of a floating `问题之书`, then settle behind the product like an archive.
- This is a conceptual visualization only; the page makes no claim that the prototype itself is connected to a live backend.

### P8 · 收尾 — 84% to 100%

Heading: `MeMe 撕掉另一半，就变成了 Me`

Body: `当我停下不间断的索取，我或许才看见了自己（ME）。`

Visual highlight:

- The fully reassembled toy prints one final strip reading `MeMe`.
- A perforation appears between the two halves; the second `Me` tears away and drifts out of frame.
- The remaining strip reads `Me`, completing the name explanation for the first time.
- The scene ends quietly with the toy and the single word `Me`; no waitlist form or generic `ASK AGAIN` sales ending remains.

## 6. Layout and Responsive Behavior

Desktop uses a pinned two-column composition. Copy alternates left and right between chapters while the WebGL product remains visually anchored near center. Chapter changes use short vertical fades and restrained tracking changes.

Mobile keeps the product in the upper 52% of the viewport and the active copy in the lower portion. Explosion distances, orbit counts, shadow resolution, and device pixel ratio are reduced. No horizontal page overflow is allowed.

For `prefers-reduced-motion: reduce`, the model uses chapter-level crossfades and small rotations instead of continuous floating, orbiting, or long exploded translations. All six sections remain available in document order.

## 7. Data Flow

1. `ScrollController` measures the story range and calculates normalized progress.
2. `deriveStoryState(progress)` maps progress to one active chapter and continuous model parameters.
3. `StoryController` updates HTML chapter visibility and accessibility attributes.
4. `MeScene` applies the same state to camera, meshes, lights, paper, and annotations.
5. The render loop draws only while scrolling, pointer easing, resize, or ambient motion requires a frame.

No component other than `ScrollController` reads `window.scrollY`.

## 8. Loading and Failure Behavior

- A CSS poster representation remains visible until the first successful WebGL frame.
- If WebGL or module loading fails, the poster stays visible and the six HTML chapters remain fully scrollable.
- If device capability is limited, cap device pixel ratio, disable expensive shadows, reduce geometry segments, and remove question-card orbit depth.
- The page must not present a blank canvas while loading or failing.

## 9. Accessibility

- Chapters use a single `h1` followed by ordered `h2` sections.
- Decorative canvas, mesh labels, and orbiting fragments are hidden from assistive technology.
- Supplied narrative copy exists once in accessible HTML.
- Active visual chapters may use `aria-current`; inactive content must not be permanently inaccessible when JavaScript is unavailable.
- Text contrast meets WCAG AA against the warm background.

## 10. Verification

Automated checks cover:

- all six headings and supplied paragraph content;
- the name remaining unexplained before P8;
- pure timeline boundaries and interpolation;
- WebGL poster/fallback hooks;
- responsive and reduced-motion rules;
- JavaScript syntax and static-server loading.

Browser verification captures desktop and mobile states at the midpoint of every chapter. Visual review checks:

- panel thickness and material quality;
- no visible solid-part intersections at chapter checkpoints;
- correct copy paired with each visual highlight;
- image-only meme in P3;
- refusal and To Do card in P4;
- question archive/book composition in P7;
- the `MeMe → Me` reveal occurring only in P8;
- no horizontal overflow or clipped primary copy.

## 11. Acceptance Criteria

The implementation is complete when:

1. The current CSS pseudo-3D assembly is no longer the primary product visualization.
2. A Three.js scene renders an enclosed and exploded physical toy with bevels, thickness, lighting, and shadows.
3. P1, P2, P3, P4, P7, and P8 appear in the supplied narrative order with their specified visual highlights.
4. `Me` is not explained before the final chapter.
5. Desktop, mobile, reduced-motion, and WebGL-failure experiences preserve the complete story.
6. Automated checks pass and rendered chapter captures demonstrate the expected visual states.

## 12. Non-goals

- production CAD accuracy;
- microphone input or speech recognition;
- live AI inference;
- real cloud question storage or report generation;
- functional To Do completion;
- commerce, waitlist submission, or analytics;
- a general-purpose Three.js component framework.

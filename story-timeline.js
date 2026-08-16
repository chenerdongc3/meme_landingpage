export const CHAPTERS = Object.freeze([
  { id: 'p1', start: 0, end: 0.14 },
  { id: 'p2', start: 0.14, end: 0.31 },
  { id: 'p3', start: 0.31, end: 0.49 },
  { id: 'p4', start: 0.49, end: 0.66 },
  { id: 'p7', start: 0.66, end: 0.84 },
  { id: 'p8', start: 0.84, end: 1 },
]);

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

export function clamp01(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1, numeric));
}

export function rangeProgress(value, start, end) {
  if (end <= start) return value >= end ? 1 : 0;
  return clamp01((clamp01(value) - start) / (end - start));
}

export function smoothstep(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

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
      const amount = smoothstep(rangeProgress(progress, start, end));
      const arc = Math.sin(Math.PI * amount);
      const mixed = mixPose(pose, nextPose, amount);
      return {
        ...mixed,
        sceneY: mixed.sceneY + arc * 0.38,
        sceneZ: mixed.sceneZ - arc * 0.90,
      };
    }
    pose = nextPose;
  }

  return { ...pose };
}

function enterExit(progress, enterStart, enterEnd, exitStart, exitEnd) {
  return clamp01(
    smoothstep(rangeProgress(progress, enterStart, enterEnd))
    * (1 - smoothstep(rangeProgress(progress, exitStart, exitEnd))),
  );
}

function chapterAt(progress) {
  if (progress >= 1) return CHAPTERS.at(-1);
  return CHAPTERS.find(({ start, end }) => progress >= start && progress < end) ?? CHAPTERS[0];
}

export function deriveStoryState(rawProgress) {
  const progress = clamp01(rawProgress);
  const chapter = chapterAt(progress);
  const chapterProgress = rangeProgress(progress, chapter.start, chapter.end);

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
}

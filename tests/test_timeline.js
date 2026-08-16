import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTERS,
  clamp01,
  rangeProgress,
  smoothstep,
  deriveScenePose,
  deriveStoryState,
} from '../story-timeline.js';

test('normalization helpers clamp and ease progress', () => {
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(2), 1);
  assert.ok(Math.abs(rangeProgress(0.4, 0.3, 0.5) - 0.5) < 1e-9);
  assert.equal(smoothstep(0), 0);
  assert.equal(smoothstep(0.5), 0.5);
  assert.equal(smoothstep(1), 1);
});

test('chapter boundaries follow P1 P2 P3 P4 P7 P8 order', () => {
  assert.deepEqual(CHAPTERS.map(({ id }) => id), ['p1', 'p2', 'p3', 'p4', 'p7', 'p8']);
  const probes = [
    [0, 'p1'],
    [0.1399, 'p1'],
    [0.14, 'p2'],
    [0.31, 'p3'],
    [0.49, 'p4'],
    [0.66, 'p7'],
    [0.84, 'p8'],
    [1, 'p8'],
  ];
  for (const [progress, chapter] of probes) {
    assert.equal(deriveStoryState(progress).chapter, chapter);
  }
});

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

test('chapter transitions arc upward and backward while crossing the stage', () => {
  for (const boundary of [0.14, 0.31, 0.49, 0.66, 0.84]) {
    const before = deriveScenePose(boundary - 0.035);
    const middle = deriveScenePose(boundary);
    const after = deriveScenePose(boundary + 0.035);
    assert.ok(middle.sceneY > Math.max(before.sceneY, after.sceneY) + 0.2);
    assert.ok(middle.sceneZ < Math.min(before.sceneZ, after.sceneZ) - 0.5);
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

test('P3 opens the product and prints an image meme', () => {
  const state = deriveStoryState(0.43);
  assert.equal(state.chapter, 'p3');
  assert.ok(state.open > 0.8);
  assert.ok(state.meme > 0.45);
  assert.equal(state.refusal, 0);
});

test('P4 refuses repeated questions and reveals a task card', () => {
  const state = deriveStoryState(0.58);
  assert.equal(state.chapter, 'p4');
  assert.ok(state.refusal > 0.8);
  assert.ok(state.task > 0.45);
  assert.equal(state.archive, 0);
});

test('P7 creates the question archive while reassembling', () => {
  const state = deriveStoryState(0.77);
  assert.equal(state.chapter, 'p7');
  assert.ok(state.archive > 0.55);
  assert.ok(state.open < 0.55);
});

test('P8 tears MeMe into Me only near the end', () => {
  assert.equal(deriveStoryState(0.839).tear, 0);
  const middle = deriveStoryState(0.93);
  assert.equal(middle.chapter, 'p8');
  assert.ok(middle.tear > 0.35);
  assert.equal(middle.finalMe, 0);
  assert.ok(deriveStoryState(0.99).finalMe > 0.8);
});

test('all continuous fields stay normalized for out-of-range input', () => {
  for (const progress of [-4, 0, 0.2, 0.5, 0.8, 1, 8]) {
    const state = deriveStoryState(progress);
    for (const key of ['progress', 'chapterProgress', 'open', 'refusal', 'meme', 'task', 'archive', 'tear', 'finalMe']) {
      assert.ok(state[key] >= 0 && state[key] <= 1, `${key} was ${state[key]}`);
    }
  }
});

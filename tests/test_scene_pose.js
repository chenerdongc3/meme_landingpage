import test from 'node:test';
import assert from 'node:assert/strict';
import { scaleScenePose } from '../me-scene.js';

const pose = Object.freeze({
  sceneX: 2,
  sceneY: 0.5,
  sceneZ: -1,
  sceneYaw: 0.2,
});

test('desktop scene pose preserves the authored whole-product motion', () => {
  assert.deepEqual(scaleScenePose(pose, false, false), {
    x: 2,
    y: 0.5,
    z: -1,
    yaw: 0.2,
  });
});

test('compact scene pose stays continuous with smaller displacement', () => {
  const scaled = scaleScenePose(pose, true, false);
  const expected = {
    x: 0.68,
    y: 0.325,
    z: -0.52,
    yaw: 0.14,
  };
  for (const [key, value] of Object.entries(expected)) {
    assert.ok(Math.abs(scaled[key] - value) < 1e-12, `${key} was ${scaled[key]}`);
  }
});

test('reduced-motion scaling compounds with compact scaling', () => {
  const scaled = scaleScenePose(pose, true, true);
  assert.ok(Math.abs(scaled.x - 0.2856) < 1e-12);
  assert.ok(Math.abs(scaled.y - 0.104) < 1e-12);
  assert.ok(Math.abs(scaled.z + 0.1664) < 1e-12);
  assert.ok(Math.abs(scaled.yaw - 0.0448) < 1e-12);
});

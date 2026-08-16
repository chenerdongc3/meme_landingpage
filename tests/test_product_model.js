import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.min.js';
import { createMeProduct, applyProductState } from '../me-product.js';

const REQUIRED_PARTS = [
  'shellFront', 'shellBack', 'shellLeft', 'shellRight', 'shellTop', 'shellBottom',
  'printer', 'paperRoll', 'pcb', 'battery', 'button', 'receipt', 'taskCard',
  'book', 'tearHalf',
];

test('procedural product exposes every independently animated physical part', () => {
  const product = createMeProduct(THREE);
  assert.equal(product.root.type, 'Group');
  for (const name of REQUIRED_PARTS) {
    assert.ok(product.parts[name]?.isObject3D, `missing ${name}`);
  }
  assert.equal(typeof product.dispose, 'function');
  product.dispose();
});

test('shell uses dense beveled geometry with finite physical thickness', () => {
  const product = createMeProduct(THREE);
  const meshes = [];
  product.parts.shellFront.traverse((object) => {
    if (object.isMesh) meshes.push(object);
  });
  const shellMesh = meshes.find((mesh) => mesh.name === 'front-panel');
  assert.ok(shellMesh);
  assert.ok(shellMesh.geometry.attributes.position.count > 100);
  shellMesh.geometry.computeBoundingBox();
  const size = shellMesh.geometry.boundingBox.getSize(new THREE.Vector3());
  assert.ok(size.x > 3);
  assert.ok(size.y > 3);
  assert.ok(size.z > 0.1);
  assert.ok([size.x, size.y, size.z].every(Number.isFinite));
  product.dispose();
});

test('exploded state separates shell panels along distinct axes', () => {
  const product = createMeProduct(THREE);
  const closed = {
    progress: 0,
    chapter: 'p1',
    chapterProgress: 0,
    open: 0,
    meme: 0,
    refusal: 0,
    task: 0,
    archive: 0,
    tear: 0,
    finalMe: 0,
  };
  applyProductState(product, closed, 0, false);
  const before = Object.fromEntries(
    ['shellFront', 'shellLeft', 'shellRight', 'shellTop', 'shellBottom']
      .map((name) => [name, product.parts[name].position.clone()]),
  );

  applyProductState(product, { ...closed, chapter: 'p3', open: 1, meme: 1 }, 0, false);

  assert.ok(product.parts.shellFront.position.z > before.shellFront.z + 1);
  assert.ok(product.parts.shellFront.position.x < before.shellFront.x - 1);
  assert.ok(product.parts.shellLeft.position.x < before.shellLeft.x - 1);
  assert.ok(product.parts.shellRight.position.x > before.shellRight.x + 1);
  assert.ok(product.parts.shellTop.position.y > before.shellTop.y + 1);
  assert.ok(product.parts.shellBottom.position.y < before.shellBottom.y - 0.5);
  product.dispose();
});

test('chapter props are visible only in their narrative states', () => {
  const product = createMeProduct(THREE);
  const base = {
    progress: 0.4,
    chapter: 'p3',
    chapterProgress: 0.5,
    open: 1,
    meme: 1,
    refusal: 0,
    task: 0,
    archive: 0,
    tear: 0,
    finalMe: 0,
  };
  applyProductState(product, base, 0, false);
  assert.equal(product.parts.receipt.visible, true);
  assert.equal(product.parts.taskCard.visible, false);
  assert.equal(product.parts.book.visible, false);

  applyProductState(product, { ...base, chapter: 'p4', meme: 0, refusal: 1, task: 1 }, 0, false);
  assert.equal(product.parts.receipt.visible, false);
  assert.equal(product.parts.taskCard.visible, true);

  applyProductState(product, { ...base, chapter: 'p7', meme: 0, open: 0.3, archive: 1 }, 0, false);
  assert.equal(product.parts.book.visible, true);
  assert.ok(product.parts.book.position.y > 1.5);
  const bookMark = product.parts.book.getObjectByName('book-question-mark');
  assert.ok(bookMark);
  assert.ok(bookMark.scale.x >= 0.7);

  applyProductState(product, { ...base, chapter: 'p8', meme: 0, open: 0, tear: 0.7 }, 0, false);
  assert.equal(product.parts.tearHalf.visible, true);
  product.dispose();
});

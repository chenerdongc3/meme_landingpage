import * as THREE from './vendor/three.module.min.js';
import { createMeProduct, applyProductState } from './me-product.js';

export function scaleScenePose(state, compact = false, reducedMotion = false) {
  const reducedScale = reducedMotion ? 0.32 : 1;
  return {
    x: state.sceneX * (compact ? 0.34 : 1) * (reducedMotion ? 0.42 : 1),
    y: state.sceneY * (compact ? 0.65 : 1) * reducedScale,
    z: state.sceneZ * (compact ? 0.52 : 1) * reducedScale,
    yaw: state.sceneYaw * (compact ? 0.70 : 1) * reducedScale,
  };
}

export function createMeScene(canvas, options = {}) {
  if (!canvas) throw new Error('A canvas is required');

  const compact = Boolean(options.compact);
  const reducedMotion = Boolean(options.reducedMotion);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !compact,
    alpha: true,
    powerPreference: compact ? 'low-power' : 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = !compact;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.35 : 1.8));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(compact ? 36 : 31, 1, 0.1, 80);
  camera.position.set(0, 0.2, compact ? 15.5 : 16.5);

  const ambient = new THREE.HemisphereLight(0xfff8e8, 0x6e675d, 2.15);
  const key = new THREE.DirectionalLight(0xfff0ce, 5.6);
  key.position.set(-5, 8, 7);
  key.castShadow = !compact;
  key.shadow.mapSize.set(compact ? 512 : 1024, compact ? 512 : 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.bias = -0.00035;
  const fill = new THREE.DirectionalLight(0xbed9ff, 2.3);
  fill.position.set(7, 1, 4);
  const rim = new THREE.DirectionalLight(0xffb72e, 2.8);
  rim.position.set(1, 4, -7);
  scene.add(ambient, key, fill, rim);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.ShadowMaterial({ color: 0x3b2c16, opacity: compact ? 0.09 : 0.15 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.18;
  floor.receiveShadow = true;
  scene.add(floor);

  const product = createMeProduct(THREE);
  const productRig = new THREE.Group();
  productRig.name = 'product-rig';
  productRig.add(product.root);
  scene.add(productRig);

  let state = {
    progress: 0,
    chapter: 'p1',
    chapterProgress: 0,
    sceneX: 0,
    sceneY: 0,
    sceneZ: 0,
    sceneYaw: 0,
    open: 0,
    meme: 0,
    refusal: 0,
    task: 0,
    archive: 0,
    tear: 0,
    finalMe: 0,
  };
  let pointerX = 0;
  let pointerY = 0;
  let firstFrame = true;
  let disposed = false;

  function setState(nextState) {
    state = nextState;
  }

  function setPointer(x, y) {
    pointerX = Math.max(-1, Math.min(1, x));
    pointerY = Math.max(-1, Math.min(1, y));
  }

  function resize() {
    if (disposed) return;
    const parent = canvas.parentElement;
    const width = Math.max(1, parent?.clientWidth || window.innerWidth);
    const height = Math.max(1, parent?.clientHeight || window.innerHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(time = 0) {
    if (disposed) return;
    applyProductState(product, state, reducedMotion ? 0 : time, compact);
    const scenePose = scaleScenePose(state, compact, reducedMotion);
    productRig.position.set(scenePose.x, scenePose.y, scenePose.z);
    productRig.rotation.y = scenePose.yaw;
    if (!reducedMotion && state.progress < 0.31) {
      product.root.rotation.y += pointerX * 0.10;
      product.root.rotation.x += pointerY * 0.07;
    }
    camera.position.y = compact ? 1.45 : 0.15;
    camera.position.z = (compact ? 15.5 : 16.5) + state.open * (compact ? 1.5 : 2.5);
    camera.lookAt(0, compact ? -0.35 : 0, 0);
    floor.material.opacity = (compact ? 0.08 : 0.14) * (1 - state.open * 0.42);
    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      options.onReady?.();
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    product.dispose();
    floor.geometry.dispose();
    floor.material.dispose();
    renderer.dispose();
  }

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    options.onFailure?.(new Error('WebGL context lost'));
  });

  resize();
  return { setState, setPointer, resize, render, dispose };
}

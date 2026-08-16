function roundedBoxGeometry(THREE, width, height, depth, radius = 0.16, bevel = 0.045) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 8,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: bevel,
    bevelThickness: bevel,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function roundedMesh(THREE, name, dimensions, material, radius, bevel) {
  const mesh = new THREE.Mesh(
    roundedBoxGeometry(THREE, dimensions[0], dimensions[1], dimensions[2], radius, bevel),
    material,
  );
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addScrews(THREE, panel, material) {
  const geometry = new THREE.CylinderGeometry(0.075, 0.075, 0.055, 20);
  for (const [x, y] of [[-1.32, -1.32], [1.32, -1.32], [-1.32, 1.32], [1.32, 1.32]]) {
    const screw = new THREE.Mesh(geometry, material);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, y, 0.145);
    screw.castShadow = true;
    panel.add(screw);
  }
}

function makeQuestionMark(THREE, material) {
  const mark = new THREE.Group();
  const curve = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.105, 12, 34, Math.PI * 1.48),
    material,
  );
  curve.rotation.z = -Math.PI * 0.18;
  curve.position.y = 0.22;
  const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.34, 5, 10), material);
  stem.position.set(0.25, -0.25, 0);
  stem.rotation.z = -0.16;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), material);
  dot.position.set(0.19, -0.70, 0);
  mark.add(curve, stem, dot);
  mark.scale.setScalar(1.15);
  return mark;
}

function makePanel(THREE, name, material, dark, white, withMark = true) {
  const group = new THREE.Group();
  group.name = name;
  const panel = roundedMesh(THREE, `${name.replace('shell', '').toLowerCase()}-panel`, [3.18, 3.18, 0.18], material, 0.28, 0.055);
  group.add(panel);
  addScrews(THREE, group, dark);
  if (withMark) {
    const mark = makeQuestionMark(THREE, white);
    mark.scale.set(1.15, 1.15, 0.45);
    mark.position.z = 0.205;
    group.add(mark);
  }
  return group;
}

function makePaperArt(THREE, dark, red, green) {
  const meme = new THREE.Group();
  const appleA = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 14), red);
  const appleB = appleA.clone();
  appleA.position.set(-0.12, 0.1, 0);
  appleB.position.set(0.12, 0.1, 0);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), green);
  leaf.scale.set(1.5, 0.55, 0.35);
  leaf.rotation.z = 0.6;
  leaf.position.set(0.18, 0.38, 0);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.18, 0.03), dark);
  stem.position.set(0.02, 0.34, 0);
  meme.add(appleA, appleB, leaf, stem);

  const me = new THREE.Group();
  const bar = new THREE.BoxGeometry(0.07, 0.55, 0.025);
  const left = new THREE.Mesh(bar, dark);
  const right = left.clone();
  const diagA = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.34, 0.025), dark);
  const diagB = diagA.clone();
  left.position.x = -0.36;
  right.position.x = 0.05;
  diagA.position.set(-0.24, 0.12, 0);
  diagB.position.set(-0.08, 0.12, 0);
  diagA.rotation.z = -0.56;
  diagB.rotation.z = 0.56;
  const eRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.045, 10, 24, Math.PI * 1.7), dark);
  eRing.position.set(0.38, -0.08, 0);
  eRing.rotation.z = 0.5;
  const eBar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.055, 0.025), dark);
  eBar.position.set(0.35, -0.08, 0);
  me.add(left, right, diagA, diagB, eRing, eBar);
  me.visible = false;
  return { meme, me };
}

function makeReceipt(THREE, materials) {
  const group = new THREE.Group();
  group.name = 'receipt';
  const paper = roundedMesh(THREE, 'receipt-paper', [1.35, 2.15, 0.035], materials.paper, 0.04, 0.012);
  paper.position.y = 0.92;
  group.add(paper);
  const art = makePaperArt(THREE, materials.ink, materials.red, materials.green);
  art.meme.position.set(0, 1.12, 0.035);
  art.me.position.set(0, 1.1, 0.035);
  group.add(art.meme, art.me);
  group.userData.memeArt = art.meme;
  group.userData.meArt = art.me;
  return group;
}

function makeTaskCard(THREE, materials) {
  const group = new THREE.Group();
  group.name = 'task-card';
  const card = roundedMesh(THREE, 'task-paper', [1.5, 1.95, 0.04], materials.paper, 0.05, 0.012);
  card.position.y = 0.8;
  const titleBar = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.09, 0.025), materials.red);
  titleBar.position.set(0, 1.35, 0.045);
  const checkbox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.025), materials.ink);
  checkbox.position.set(-0.42, 0.75, 0.045);
  const inner = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.19, 0.03), materials.paper);
  inner.position.copy(checkbox.position);
  inner.position.z += 0.01;
  const lineA = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.055, 0.025), materials.ink);
  lineA.position.set(0.23, 0.82, 0.045);
  const lineB = lineA.clone();
  lineB.scale.x = 0.72;
  lineB.position.y = 0.65;
  group.add(card, titleBar, checkbox, inner, lineA, lineB);
  return group;
}

function makeQuestionBook(THREE, materials) {
  const group = new THREE.Group();
  group.name = 'question-book';
  const back = roundedMesh(THREE, 'book-cover', [2.15, 2.75, 0.18], materials.ink, 0.08, 0.02);
  const pages = roundedMesh(THREE, 'book-pages', [1.96, 2.58, 0.27], materials.paper, 0.06, 0.015);
  pages.position.z = 0.14;
  const mark = makeQuestionMark(THREE, materials.ink);
  mark.name = 'book-question-mark';
  mark.position.set(0, 0.08, 0.34);
  mark.scale.setScalar(0.78);
  group.add(back, pages, mark);
  for (let index = 0; index < 5; index += 1) {
    const card = roundedMesh(THREE, `question-card-${index}`, [0.72, 0.34, 0.025], materials.paper, 0.03, 0.006);
    card.position.set(Math.cos(index * 1.7) * 2, Math.sin(index * 1.3) * 1.7, 0.2 + index * 0.04);
    card.rotation.z = index * 0.45 - 0.8;
    card.userData.orbitIndex = index;
    group.add(card);
  }
  return group;
}

export function createMeProduct(THREE) {
  const root = new THREE.Group();
  root.name = 'me-product';

  const materials = {
    yellow: new THREE.MeshPhysicalMaterial({ color: 0xf4ae08, roughness: 0.32, metalness: 0.02, clearcoat: 0.7, clearcoatRoughness: 0.25 }),
    yellowDark: new THREE.MeshStandardMaterial({ color: 0xc97b00, roughness: 0.48 }),
    ink: new THREE.MeshStandardMaterial({ color: 0x25231e, roughness: 0.48, metalness: 0.15 }),
    white: new THREE.MeshStandardMaterial({ color: 0xfffdf6, roughness: 0.38 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xfffdf5, roughness: 0.76, side: THREE.DoubleSide }),
    red: new THREE.MeshPhysicalMaterial({ color: 0xe54a35, roughness: 0.3, clearcoat: 0.55 }),
    green: new THREE.MeshStandardMaterial({ color: 0x4c7c5c, roughness: 0.55 }),
    pcb: new THREE.MeshStandardMaterial({ color: 0x386b55, roughness: 0.54, metalness: 0.08 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x85877f, roughness: 0.3, metalness: 0.72 }),
    glow: new THREE.MeshStandardMaterial({ color: 0xffcf48, emissive: 0xff8a00, emissiveIntensity: 0.25 }),
  };

  const parts = {};
  parts.shellFront = makePanel(THREE, 'shellFront', materials.yellow, materials.ink, materials.white);
  parts.shellBack = makePanel(THREE, 'shellBack', materials.yellowDark, materials.ink, materials.white, false);
  parts.shellLeft = makePanel(THREE, 'shellLeft', materials.yellow, materials.ink, materials.white);
  parts.shellRight = makePanel(THREE, 'shellRight', materials.yellow, materials.ink, materials.white);
  parts.shellTop = makePanel(THREE, 'shellTop', materials.yellow, materials.ink, materials.white, false);
  parts.shellBottom = makePanel(THREE, 'shellBottom', materials.yellowDark, materials.ink, materials.white, false);

  parts.shellFront.position.set(0, 0, 1.62);
  parts.shellBack.position.set(0, 0, -1.62);
  parts.shellBack.rotation.y = Math.PI;
  parts.shellLeft.position.set(-1.62, 0, 0);
  parts.shellLeft.rotation.y = -Math.PI / 2;
  parts.shellRight.position.set(1.62, 0, 0);
  parts.shellRight.rotation.y = Math.PI / 2;
  parts.shellTop.position.set(0, 1.62, 0);
  parts.shellTop.rotation.x = -Math.PI / 2;
  parts.shellBottom.position.set(0, -1.62, 0);
  parts.shellBottom.rotation.x = Math.PI / 2;

  const frame = new THREE.Group();
  frame.name = 'internal-frame';
  const postGeometry = new THREE.CylinderGeometry(0.055, 0.055, 2.7, 12);
  for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) {
    const post = new THREE.Mesh(postGeometry, materials.metal);
    post.position.set(x, 0, z);
    frame.add(post);
  }
  const innerPlate = roundedMesh(THREE, 'inner-plate', [2.75, 2.75, 0.10], materials.yellowDark, 0.18, 0.025);
  innerPlate.rotation.x = Math.PI / 2;
  innerPlate.position.y = -1.2;
  frame.add(innerPlate);

  parts.paperRoll = new THREE.Group();
  parts.paperRoll.name = 'paper-roll';
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.9, 36), materials.paper);
  roll.rotation.z = Math.PI / 2;
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.1, 20), materials.metal);
  axle.rotation.z = Math.PI / 2;
  parts.paperRoll.add(roll, axle);
  parts.paperRoll.position.set(0, 0.94, -0.16);

  parts.printer = new THREE.Group();
  parts.printer.name = 'printer';
  const printerBody = roundedMesh(THREE, 'printer-body', [2.35, 0.56, 0.92], materials.ink, 0.11, 0.025);
  const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.05, 24), materials.metal);
  roller.rotation.z = Math.PI / 2;
  roller.position.set(0, 0.27, 0.25);
  parts.printer.add(printerBody, roller);
  parts.printer.position.set(0, 0.27, 0.35);

  parts.pcb = new THREE.Group();
  parts.pcb.name = 'pcb';
  const board = roundedMesh(THREE, 'pcb-board', [2.15, 1.25, 0.10], materials.pcb, 0.10, 0.02);
  const chip = roundedMesh(THREE, 'main-chip', [0.62, 0.45, 0.12], materials.ink, 0.04, 0.01);
  chip.position.z = 0.11;
  parts.pcb.add(board, chip);
  parts.pcb.position.set(-0.18, -0.47, 0.38);

  parts.battery = roundedMesh(THREE, 'battery', [1.82, 0.72, 0.52], materials.ink, 0.13, 0.035);
  parts.battery.position.set(0.22, -0.9, -0.48);

  parts.button = new THREE.Group();
  parts.button.name = 'button';
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.6, 0.20, 36), materials.ink);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.50, 0.24, 36), materials.red);
  cap.position.y = -0.18;
  parts.button.add(collar, cap);
  parts.button.position.set(0, -1.83, 0.12);

  const light = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 12), materials.glow);
  light.name = 'status-light';
  light.position.set(1.23, 0.52, 1.36);
  parts.statusLight = light;

  parts.receipt = makeReceipt(THREE, materials);
  parts.receipt.position.set(0, 1.45, 0.18);
  parts.taskCard = makeTaskCard(THREE, materials);
  parts.taskCard.position.set(0, 1.45, 0.16);
  parts.book = makeQuestionBook(THREE, materials);
  parts.book.position.set(0, 0.2, -2.2);
  parts.tearHalf = roundedMesh(THREE, 'tear-half', [0.7, 1.0, 0.035], materials.paper, 0.025, 0.008);
  parts.tearHalf.position.set(0.38, 2.65, 0.25);

  const shellNames = ['shellFront', 'shellBack', 'shellLeft', 'shellRight', 'shellTop', 'shellBottom'];
  root.add(frame, parts.paperRoll, parts.printer, parts.pcb, parts.battery, parts.button, light);
  for (const name of shellNames) root.add(parts[name]);
  root.add(parts.receipt, parts.taskCard, parts.book, parts.tearHalf);

  root.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  const dispose = () => {
    const geometries = new Set();
    const usedMaterials = new Set();
    root.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (Array.isArray(object.material)) object.material.forEach((item) => usedMaterials.add(item));
      else if (object.material) usedMaterials.add(object.material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    usedMaterials.forEach((material) => material.dispose());
  };

  return { root, parts, materials, dispose };
}

export function applyProductState(product, state, time = 0, compact = false) {
  const { root, parts, materials } = product;
  const open = state.open;
  const spread = compact ? 0.68 : 1;

  const frontDirection = state.chapter === 'p4' ? 1 : -1;
  parts.shellFront.position.set(frontDirection * open * 2.05 * spread, 0, 1.62 + open * 1.15 * spread);
  parts.shellBack.position.set(0, 0, -1.62 - open * 0.85 * spread);
  parts.shellLeft.position.set(-1.62 - open * 2.05 * spread, open * 0.12, 0);
  parts.shellRight.position.set(1.62 + open * 2.05 * spread, -open * 0.08, 0);
  parts.shellTop.position.set(0, 1.62 + open * 1.82 * spread, -open * 0.16);
  parts.shellBottom.position.set(0, -1.62 - open * 1.02 * spread, open * 0.2);

  parts.shellFront.rotation.x = -open * 0.05;
  parts.shellFront.rotation.y = open * 0.08;
  parts.shellLeft.rotation.y = -Math.PI / 2 - open * 0.09;
  parts.shellRight.rotation.y = Math.PI / 2 + open * 0.09;
  parts.shellTop.rotation.x = -Math.PI / 2 - open * 0.06;

  parts.paperRoll.position.y = 0.94 + open * 0.48;
  parts.printer.position.x = open * 0.22;
  parts.printer.position.z = 0.35 + open * 0.18;
  parts.pcb.position.x = -0.18 - open * 0.32;
  parts.battery.position.y = -0.9 - open * 0.34;
  parts.button.position.y = -1.83 - open * 0.42;

  const showingFinal = state.chapter === 'p8';
  parts.receipt.visible = state.meme > 0.001 || showingFinal;
  parts.receipt.scale.y = showingFinal ? 1 : Math.max(0.06, state.meme);
  parts.receipt.position.y = 1.45 + (showingFinal ? state.tear * 1.0 : state.meme * 0.8);
  parts.receipt.userData.memeArt.visible = !showingFinal;
  parts.receipt.userData.meArt.visible = showingFinal;

  parts.taskCard.visible = state.task > 0.001;
  parts.taskCard.scale.y = Math.max(0.06, state.task);
  parts.taskCard.position.y = 1.45 + state.task * 0.95;

  parts.book.visible = state.archive > 0.001;
  parts.book.scale.setScalar(0.62 + state.archive * 0.38);
  parts.book.position.x = state.archive * 1.3;
  parts.book.position.y = 0.2 + state.archive * 2.3;
  parts.book.position.z = -1.65 + state.archive * 2.45;
  parts.book.rotation.y = -0.38 + Math.sin(time * 0.00035) * 0.05;
  parts.book.rotation.z = 0.08;
  parts.book.children.forEach((child) => {
    if (Number.isInteger(child.userData.orbitIndex)) {
      const index = child.userData.orbitIndex;
      const angle = time * 0.00028 + index * 1.25;
      const radius = (1 - state.archive) * (2.5 + index * 0.12);
      child.position.x = Math.cos(angle) * radius;
      child.position.y = Math.sin(angle * 1.2) * radius * 0.58;
    }
  });

  parts.tearHalf.visible = state.tear > 0.001;
  parts.tearHalf.position.set(0.38 + state.tear * 2.4, 2.65 - state.tear * 0.4, 0.25 + state.tear * 0.55);
  parts.tearHalf.rotation.z = -state.tear * 0.72;
  parts.tearHalf.rotation.y = state.tear * 0.8;

  materials.glow.color.setHex(state.refusal > 0.2 ? 0xe54a35 : 0xffcf48);
  materials.glow.emissive.setHex(state.refusal > 0.2 ? 0xe21f18 : 0xff8a00);
  materials.glow.emissiveIntensity = 0.25 + state.refusal * 2.2;

  const heroRotation = state.chapter === 'p1' ? state.chapterProgress * 0.65 : 0.65;
  root.rotation.y = -0.48 + heroRotation + state.archive * 0.24;
  root.rotation.x = -0.13 + open * 0.05;
  root.position.y = Math.sin(time * 0.00075) * 0.045 * (state.progress < 0.84 ? 1 : 0.25);
  root.scale.setScalar(compact ? 0.78 : 1);
}

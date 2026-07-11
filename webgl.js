/* ============================================================
   POSSO FARLO IO — webgl.js
   Three.js architectural wireframe scene — hero decoration
   ============================================================ */
import * as THREE from 'three';

let renderer, scene, camera, archGroup;
let animId = null;
let isHeroVisible = true;
let scrollProgress = 0;
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initWebGL() {
  const canvas = document.getElementById('hero-canvas');
  const hero   = document.querySelector('.hero');
  if (!canvas || !hero) return;

  if (!window.WebGLRenderingContext) { canvas.style.display = 'none'; return; }

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  } catch (_) { canvas.style.display = 'none'; return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  scene  = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 1.2, 6);
  camera.lookAt(0, 0, 0);

  buildScene();
  handleResize();

  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', onScroll, { passive: true });

  if (window.innerWidth > 768 && !prefersReduced) {
    window.addEventListener('mousemove', onMouse, { passive: true });
  }

  const vis = new IntersectionObserver(([e]) => {
    isHeroVisible = e.isIntersecting;
    if (isHeroVisible && !animId) animate();
  }, { threshold: 0.05 });
  vis.observe(hero);

  if (prefersReduced) {
    renderer.render(scene, camera);
    return;
  }
  animate();
}

function buildScene() {
  archGroup = new THREE.Group();
  scene.add(archGroup);

  const isMobile = window.innerWidth < 768;

  /* ---- Materials ---- */
  const mGrid   = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.03 });
  const mBox    = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 });
  const mAccent = new THREE.LineBasicMaterial({ color: 0xF26A1B, transparent: true, opacity: 0.45 });
  const mPoint  = new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.18, sizeAttenuation: true });

  /* ---- Grid floor ---- */
  const grid = new THREE.GridHelper(16, 14, 0xffffff, 0xffffff);
  grid.position.y = -2.8;
  grid.material.transparent = true;
  grid.material.opacity = 0.03;
  archGroup.add(grid);

  /* ---- Building volumes ---- */
  const buildings = [
    [-3.6, 3.0, -1.0, 0.85, 0.85],
    [-2.2, 2.0, -0.5, 1.10, 0.80],
    [-0.7, 4.2, -1.4, 0.70, 0.70],
    [ 0.7, 1.6, -0.7, 1.30, 1.00],
    [ 2.1, 3.6, -1.1, 0.80, 0.80],
    [ 3.3, 2.2, -0.5, 0.95, 0.90],
    [ 3.9, 1.4, -1.7, 0.60, 0.60],
  ];

  (isMobile ? buildings.slice(0, 4) : buildings).forEach(([x, h, z, w, d]) => {
    const geo  = new THREE.BoxGeometry(w, h, d);
    const edge = new THREE.EdgesGeometry(geo);
    const mesh = new THREE.LineSegments(edge, mBox.clone());
    mesh.position.set(x, h / 2 - 2.8, z);
    archGroup.add(mesh);
    geo.dispose(); edge.dispose();
  });

  /* ---- Orange accent lines ---- */
  [
    [[-4.5, -1.2, -0.5], [4.5, -1.2, -0.5]],
    [[-3.0, -0.1, -1.0], [3.0, -0.1, -1.0]],
    [[-1.8,  0.9, -0.3], [1.8,  0.9, -0.3]],
  ].forEach(([a, b]) => {
    const geo  = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
    const line = new THREE.Line(geo, mAccent.clone());
    archGroup.add(line);
    geo.dispose();
  });

  /* ---- Particles ---- */
  const count = isMobile ? 55 : 120;
  const pos   = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 13;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 7;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  archGroup.add(new THREE.Points(pGeo, mPoint));
  pGeo.dispose();
}

function animate() {
  if (prefersReduced || !renderer) return;
  animId = requestAnimationFrame(animate);
  if (!isHeroVisible) return;

  /* Mouse lerp */
  mouse.x += (mouse.tx - mouse.x) * 0.035;
  mouse.y += (mouse.ty - mouse.y) * 0.035;

  /* Slow continuous rotation */
  archGroup.rotation.y += 0.0003;

  /* Mouse tilt (max ±0.04 rad ≈ 2.3°) */
  archGroup.rotation.x = mouse.y * 0.04;
  archGroup.rotation.z = mouse.x * -0.025;

  /* Scroll: camera retreats slightly */
  camera.position.z = 6 - scrollProgress * 1.0;
  camera.position.y = 1.2 - scrollProgress * 0.4;

  renderer.render(scene, camera);
}

function onMouse(e) {
  mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
}

function onScroll() {
  const hero = document.querySelector('.hero');
  scrollProgress = hero ? Math.min(window.scrollY / hero.offsetHeight, 1) : 0;
}

function handleResize() {
  if (!renderer || !camera) return;
  const hero = document.querySelector('.hero');
  const w = window.innerWidth;
  const h = hero ? hero.offsetHeight : window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/* ---- Boot ---- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWebGL);
} else {
  initWebGL();
}

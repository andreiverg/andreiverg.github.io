/**
 * Contact photo drum — square tiles on the outside of a cylinder (CSS 3D).
 * Geometry lives in CSS (--tile, --radius, --persp); JS only fills the ring
 * and drives the spin (auto-rotation + drag with inertia).
 */

const TILE_COUNT = 27; // tiles around the full circumference
const AUTO_SPEED = 0.0011; // rad per frame (~60fps)

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initConnectRing(stage) {
  if (!stage) return;
  const ring = stage.querySelector('[data-ring]');
  const sources = [...ring.querySelectorAll('img')];
  if (!sources.length) return;

  const step = (Math.PI * 2) / TILE_COUNT;
  const order = sequence(sources.length, TILE_COUNT);
  ring.textContent = '';
  for (let i = 0; i < TILE_COUNT; i++) {
    const img = sources[order[i]].cloneNode();
    img.className = 'ring-tile';
    img.style.setProperty('--a', `${i * step}rad`);
    ring.appendChild(img);
  }

  let angle = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;
  let lastT = 0;
  let pointerId = null;
  let visible = false;
  let last = performance.now();

  // drag distance -> angle: one tile width of drag ≈ one step
  const pxPerRad = () => {
    const tile = parseFloat(getComputedStyle(ring.querySelector('.ring-tile')).width) || 427;
    return (tile * 1.09) / step;
  };
  let ratio = pxPerRad();
  window.addEventListener('resize', () => { ratio = pxPerRad(); });

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    pointerId = e.pointerId;
    lastX = e.clientX;
    lastT = performance.now();
    velocity = 0;
    stage.classList.add('is-dragging');
    try { stage.setPointerCapture(pointerId); } catch (_) { /* noop */ }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now();
    const d = (e.clientX - lastX) / ratio;
    angle += d;
    velocity = (d / Math.max(1, now - lastT)) * 16.667;
    lastX = e.clientX;
    lastT = now;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  const apply = () => ring.style.setProperty('--spin', `${angle}rad`);

  function frame(now) {
    if (!visible) return;
    const dt = Math.min(64, now - last) / 16.667;
    last = now;
    if (!dragging) {
      angle += velocity * dt;
      velocity *= Math.pow(0.94, dt);
      if (!reduceMotion) angle -= AUTO_SPEED * dt;
    }
    apply();
    requestAnimationFrame(frame);
  }

  apply();
  new IntersectionObserver(([entry]) => {
    const was = visible;
    visible = entry.isIntersecting;
    if (visible && !was) { last = performance.now(); requestAnimationFrame(frame); }
  }, { rootMargin: '100px 0px' }).observe(stage.closest('.ring-tilt'));
}

// Cycle through the sources, then pad so no image ever sits next to itself
// (including across the seam where the ring closes).
function sequence(n, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(i % n);
  for (let i = Math.floor(count / n) * n; i < count; i++) {
    const prev = out[i - 1];
    const next = i === count - 1 ? out[0] : -1;
    for (let k = 0; k < n; k++) {
      const c = (prev + 2 + k) % n;
      if (c !== prev && c !== next) { out[i] = c; break; }
    }
  }
  return out;
}

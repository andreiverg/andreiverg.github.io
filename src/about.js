import './page.js';

/**
 * About photo — resize it like a layer in Figma, and the page reflows around
 * it: the photo's grid column grows or shrinks, so the intro, skills and
 * everything below shift to make room. Aspect ratio stays locked.
 * Clamped between MIN and MAX of its original size, and never so wide that
 * the text columns get squeezed. Double-click the photo to reset.
 */
const MIN = 0.55;
const MAX = 1.6;
const TEXT_MIN = 0.5; // the photo may take at most this share of the grid's width

const grid = document.querySelector('.ab-grid');
const photo = document.querySelector('.ab-photo');
const frame = document.querySelector('[data-resize]');
const label = document.querySelector('[data-resize-label]');
const HINT = '· drag a corner to resize';

if (grid && photo && frame) {
  let base = null; // natural photo size + layout info, measured at scale 1
  let s = 1;

  const measure = () => {
    reset(false);
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const r = photo.getBoundingClientRect();
    base = { w: r.width, h: frame.getBoundingClientRect().height, cols, gridW: grid.clientWidth };
  };

  const maxScale = () => {
    if (base.cols === 1) return Math.min(MAX, grid.clientWidth / base.w);
    return Math.min(MAX, (base.gridW * TEXT_MIN) / base.w);
  };

  const layout = () => {
    const w = base.w * s;
    if (base.cols === 1) {
      photo.style.width = `${w}px`;
    } else {
      // keep the other columns' proportions; only the photo column becomes fixed
      const rest = 'minmax(0, 1.3fr)';
      const photoLast = grid.lastElementChild === photo;
      grid.style.gridTemplateColumns = photoLast ? `${rest} ${w}px` : `${w}px ${rest}`;
    }
    frame.classList.toggle('is-resized', s !== 1);
    if (label) label.textContent = `· ${Math.round(w)} × ${Math.round(base.h * s)}`;
  };

  function reset(animate = true) {
    s = 1;
    if (animate) {
      grid.classList.add('is-resetting');
      setTimeout(() => grid.classList.remove('is-resetting'), 450);
    }
    grid.style.gridTemplateColumns = '';
    photo.style.width = '';
    frame.classList.remove('is-resized');
    if (label) label.textContent = HINT;
  }

  frame.querySelectorAll('[data-h]').forEach((h) => {
    const [sx, sy] = h.dataset.h.split(',').map(Number);
    h.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      if (!base) measure();
      h.setPointerCapture(e.pointerId);
      frame.classList.add('is-dragging');
      const start = { x: e.clientX, y: e.clientY, s };
      const cap = maxScale();

      const move = (ev) => {
        // dragging a handle outward grows the photo, inward shrinks it
        const dx = ((ev.clientX - start.x) * sx) / base.w;
        const dy = ((ev.clientY - start.y) * sy) / base.h;
        const grow = sx && sy ? (dx + dy) / 2 : sx ? dx : dy;
        s = Math.min(cap, Math.max(MIN, start.s + grow));
        layout();
      };
      const up = () => {
        frame.classList.remove('is-dragging');
        h.removeEventListener('pointermove', move);
        h.removeEventListener('pointerup', up);
        h.removeEventListener('pointercancel', up);
      };
      h.addEventListener('pointermove', move);
      h.addEventListener('pointerup', up);
      h.addEventListener('pointercancel', up);
    });
  });

  frame.addEventListener('dblclick', () => reset(true));
  window.addEventListener('resize', () => { if (base) { base = null; reset(false); } });
}

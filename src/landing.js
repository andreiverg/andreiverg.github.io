/**
 * Landing page — the page assembles itself on every visit as if it were being
 * built live in Figma: a named cursor picks tools from the toolbar, draws the
 * colour fields, types the word, signs the name, duplicates the links and
 * drops itself into the badge. Click, tap or press any key to skip.
 *
 * The finished layout is plain HTML/CSS; this script only choreographs it.
 */

import { initTheme } from './theme.js';
import { initCompose } from './compose.js';
import { initDino } from './dino.js';

const root = document.documentElement;
const landing = document.querySelector('[data-landing]');
const fig = document.querySelector('[data-fig]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = (s) => landing.querySelector(s);
const $$ = (s) => [...landing.querySelectorAll(s)];

const cursor = $('[data-fig-cursor]');
const select = $('[data-fig-select]');
const sizeLabel = $('[data-fig-size]');
const measure = $('[data-fig-measure]');
const measureLabel = $('[data-fig-measure-label]');
const caret = $('[data-fig-caret]');
const tools = Object.fromEntries($$('[data-tool]').map((el) => [el.dataset.tool, el]));
const replayBtn = $('[data-replay]');

const word = $('[data-build="word"]');
const wordMain = $('[data-word]');
const blobs = $$('[data-build="blob"]');
const year = $('[data-build="year"]');
const role = $('[data-build="role"]');
const sign = $('[data-build="sign"]');
const badge = $('[data-build="badge"]');
const links = $$('[data-build="link"]');
const pop = $('[data-build="pop"]');

// Split the word into letters once, so it can be "typed".
const letters = [...wordMain.textContent].map((ch) => {
  const s = document.createElement('span');
  s.textContent = ch;
  return s;
});
wordMain.textContent = '';
letters.forEach((s) => wordMain.appendChild(s));

let run = 0; // increments on every (re)start / skip, cancelling older timelines
const pos = { x: 0, y: 0 };

class Cancelled extends Error {}
const alive = (id) => { if (id !== run) throw new Cancelled(); };
const wait = (ms, id) => new Promise((res) => setTimeout(res, ms)).then(() => alive(id));

const box = (el) => {
  const r = el.getBoundingClientRect();
  const o = landing.getBoundingClientRect();
  return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height };
};
const visible = (el) => { const b = box(el); return b.w > 0 && b.h > 0; };

function place(x, y) {
  pos.x = x; pos.y = y;
  cursor.style.transform = `translate(${x}px, ${y}px)`;
}

async function move(x, y, ms, id, easing = 'cubic-bezier(0.55, 0, 0.2, 1)') {
  const from = `translate(${pos.x}px, ${pos.y}px)`;
  const to = `translate(${x}px, ${y}px)`;
  pos.x = x; pos.y = y;
  const a = cursor.animate([{ transform: from }, { transform: to }], { duration: ms, easing, fill: 'forwards' });
  await a.finished.catch(() => {});
  cursor.style.transform = to;
  a.cancel();
  alive(id);
}

function tool(name) {
  Object.values(tools).forEach((t) => t.classList.toggle('is-active', t === tools[name]));
}

function setSelect(b, label, smooth = false) {
  select.classList.toggle('is-smooth', smooth);
  Object.assign(select.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` });
  sizeLabel.textContent = label ?? `${Math.round(b.w)} × ${Math.round(b.h)}`;
  select.classList.add('is-on');
}
const hideSelect = () => select.classList.remove('is-on');

// Drag out a rectangle from b's top-left to its bottom-right, cursor in lockstep.
async function drawRect(b, ms, id) {
  const clipped = clipToView(b);
  await move(clipped.x, clipped.y, 380, id);
  cursor.classList.add('is-down');
  const t0 = performance.now();
  await new Promise((res) => {
    const step = (now) => {
      if (id !== run) return res();
      const t = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      const w = clipped.w * e;
      const h = clipped.h * e;
      setSelect({ x: clipped.x, y: clipped.y, w, h }, `${Math.round(b.w * e)} × ${Math.round(b.h * e)}`);
      place(clipped.x + w, clipped.y + h);
      t < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  });
  alive(id);
  cursor.classList.remove('is-down');
}

function clipToView(b) {
  const W = landing.clientWidth;
  const H = landing.clientHeight;
  const x = Math.max(12, b.x);
  const y = Math.max(12, b.y);
  return { x, y, w: Math.min(W - 90, b.x + b.w) - x, h: Math.min(H - 60, b.y + b.h) - y };
}

const built = (el) => el.classList.add('is-built');

/* ---------------------------------------------------------------- timeline */

async function build(id) {
  const W = landing.clientWidth;
  const H = landing.clientHeight;
  const small = W < 560;

  // 0 — open the file
  place(W * 0.72, H * 0.82);
  fig.classList.add('show-grid', 'show-chrome');
  await wait(250, id);
  cursor.classList.add('is-on');
  tool('move');
  await wait(300, id);

  // 1 — ellipse tool: draw the colour field, then the blur "effect" spreads it
  tool('shape');
  await move(W - (small ? 70 : 180), H * 0.05 + 40, 520, id);
  await drawRect({ x: W * (small ? 0.42 : 0.5), y: 20, w: W * (small ? 0.58 : 0.5) - 20, h: H * 0.62 }, 520, id);
  blobs.forEach((b) => { b.classList.add('is-drawn', 'is-built'); });
  await wait(60, id);
  blobs.forEach((b) => b.classList.remove('is-drawn')); // blur(0) → blur(70px)
  setSelect(clipToView({ x: W * (small ? 0.42 : 0.5), y: 20, w: W * 0.5, h: H * 0.62 }), 'Layer blur 70', false);
  await wait(420, id);
  hideSelect();

  // 2 — text tool: type the word
  tool('text');
  const wb = box(word);
  const lineTop = wb.y + wb.h * 0.2;
  const lineH = wb.h * 0.66;
  await move(wb.x + 4, lineTop + lineH * 0.5, 560, id);
  cursor.classList.add('is-down');
  await wait(90, id);
  cursor.classList.remove('is-down');
  caret.classList.add('is-on');
  Object.assign(caret.style, { left: `${wb.x}px`, top: `${lineTop}px`, height: `${lineH}px` });
  place(wb.x + 18, lineTop + lineH + 6);
  for (const l of letters) {
    const lb = box(l);
    const shown = lb.x + lb.w - wb.x;
    wordMain.style.setProperty('--hide', `${Math.max(0, wb.w - shown)}px`);
    caret.style.left = `${lb.x + lb.w}px`;
    setSelect({ x: wb.x, y: wb.y, w: lb.x + lb.w - wb.x, h: wb.h }, 'Bodoni Moda · 500');
    await wait(small ? 55 : 70, id);
  }
  caret.classList.remove('is-on');
  setSelect(wb, undefined, true);
  await wait(240, id);
  // effect: motion blur on the left of the word (ref 4)
  word.classList.add('has-fx');
  sizeLabel.textContent = 'Motion blur';
  await wait(420, id);
  built(word);

  // 3 — rectangle tool: the year tag; text tool: the role line
  tool('shape');
  const yb = box(year);
  await drawRect(yb, 300, id);
  built(year);
  await wait(140, id);
  if (visible(role)) {
    tool('text');
    const rb = box(role);
    await move(rb.x, rb.y + rb.h, 320, id);
    built(role);
    setSelect(rb, undefined, true);
    await wait(260, id);
  }

  // 4 — pen tool: sign the name, cursor tracing the stroke
  tool('pen');
  const sb = box(sign);
  await move(sb.x, sb.y + sb.h * 0.7, 360, id);
  hideSelect();
  built(sign);
  await move(sb.x + sb.w, sb.y + sb.h * 0.25, 900, id, 'cubic-bezier(0.45, 0, 0.25, 1)');
  setSelect(sb, undefined, true);
  await wait(200, id);

  // 5 — move tool: place the first link, alt-drag the rest out of it
  tool('move');
  const first = links[0];
  const fb = box(first);
  await move(fb.x + fb.w * 0.5, fb.y + fb.h * 0.5, 480, id);
  built(first);
  setSelect(fb, undefined, true);
  // spacing between the word and the row
  const gap = Math.round(fb.y - (wb.y + wb.h));
  if (gap > 30) {
    Object.assign(measure.style, { left: `${fb.x + fb.w * 0.5}px`, top: `${wb.y + wb.h}px`, height: `${gap}px` });
    measureLabel.textContent = gap;
    measure.classList.add('is-on');
  }
  await wait(380, id);
  for (const l of links.slice(1)) {
    const lb = box(l);
    const dx = fb.x - lb.x;
    const dy = fb.y - lb.y;
    l.style.transition = 'none';
    l.style.transform = `translate(${dx}px, ${dy}px)`;
    l.getBoundingClientRect();
    l.style.transition = '';
    built(l);
    l.style.transform = '';
    setSelect(lb, undefined, true);
    await move(lb.x + lb.w * 0.5, lb.y + lb.h * 0.5, 360, id);
    await wait(60, id);
  }
  measure.classList.remove('is-on');
  hideSelect();

  // 5b — comment tool: pin a note on the name, pointing to the About page
  tool('comment');
  const pb = box(pop);
  await move(pb.x + pb.h * 0.5, pb.y + pb.h * 0.5, 520, id);
  cursor.classList.add('is-down');
  await wait(110, id);
  cursor.classList.remove('is-down');
  built(pop);
  await wait(520, id);

  // 6 — the cursor drops into the badge and becomes the glossy pointer (ref 4)
  const bb = box(badge);
  built(badge);
  await move(bb.x + bb.w * 0.5, bb.y + bb.h * 0.5, 620, id);
  setSelect(bb, undefined, true);
  badge.classList.add('has-cursor');
  cursor.classList.remove('is-on');
  await wait(450, id);

  finish();
}

/* ------------------------------------------------------------ start / skip */

function finish() {
  run++;
  hideSelect();
  caret.classList.remove('is-on');
  measure.classList.remove('is-on');
  cursor.classList.remove('is-on', 'is-down');
  tool(null);
  const wasBuilding = root.classList.contains('is-building');
  fig.classList.remove('show-grid', 'show-chrome');
  if (wasBuilding) {
    fig.classList.add('is-leaving');
    setTimeout(() => fig.classList.remove('is-leaving'), 650);
  }
  root.classList.remove('is-building');
  $$('[data-build]').forEach((el) => { el.style.transform = ''; });
  removeSkip();
  replayBtn.hidden = false;
}

function reset() {
  root.classList.add('is-building');
  replayBtn.hidden = true;
  fig.classList.remove('is-leaving');
  $$('.is-built').forEach((el) => el.classList.remove('is-built'));
  wordMain.style.removeProperty('--hide');
  word.classList.remove('has-fx');
  badge.classList.remove('has-cursor');
}

const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
function onSkip(e) {
  if (e.type === 'keydown' && e.key === 'Tab') return; // let keyboard users tab straight to links
  if (e.target?.closest?.('[data-theme-toggle]')) return; // switching theme shouldn't skip the build
  finish();
}
const addSkip = () => skipEvents.forEach((t) => window.addEventListener(t, onSkip, { passive: true }));
const removeSkip = () => skipEvents.forEach((t) => window.removeEventListener(t, onSkip));

function start() {
  if (reduceMotion) { finish(); replayBtn.hidden = true; return; }
  reset();
  const id = ++run;
  setTimeout(addSkip, 0);
  build(id).catch((err) => { if (!(err instanceof Cancelled)) { console.error(err); finish(); } });
}

replayBtn.addEventListener('click', (e) => { e.stopPropagation(); start(); });
// Keyboard focus on a link mid-build should show the finished page.
landing.addEventListener('focusin', () => { if (root.classList.contains('is-building')) finish(); });

// Fonts change the word's metrics, so measure only once they're in.
root.classList.add('is-building');
(document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve())
  .then(start);

initTheme();
initCompose();
initDino();

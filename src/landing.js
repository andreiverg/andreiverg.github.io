/**
 * Landing page — the page assembles itself on every visit as if it were being
 * built live in Figma by three people at once: Andrei types the word, Nathan
 * draws the colour field and signs the name, George lays out the links and pins
 * the comment, then Andrei drops into the badge. Click, tap or press any key to skip.
 *
 * The finished layout is plain HTML/CSS; this script only choreographs it.
 */

import { initTheme } from './theme.js';
import { initCompose } from './compose.js';
import { initDino } from './dino.js';
import { initSecrets } from './secrets.js';

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

class Cancelled extends Error {}
const alive = (id) => { if (id !== run) throw new Cancelled(); };
const wait = (ms, id) => new Promise((res) => setTimeout(res, ms)).then(() => alive(id));

const box = (el) => {
  const r = el.getBoundingClientRect();
  const o = landing.getBoundingClientRect();
  return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height };
};
const visible = (el) => { const b = box(el); return b.w > 0 && b.h > 0; };

/* ------------------------------------------------------------ multiplayer
   Several people build the page at once, Figma-style: each has their own
   cursor, name tag and selection box in their own colour. */

function makeActor(name, color) {
  if (!color) return { name, cur: cursor, sel: select, size: sizeLabel, pos: { x: 0, y: 0 } };
  const cur = cursor.cloneNode(true);
  cur.removeAttribute('data-fig-cursor');
  cur.querySelector('.fig-name').textContent = name;
  cur.style.setProperty('--who', color);
  const sel = select.cloneNode(true);
  sel.removeAttribute('data-fig-select');
  sel.style.setProperty('--who', color);
  const size = sel.querySelector('[data-fig-size]');
  size.removeAttribute('data-fig-size');
  fig.append(sel, cur);
  return { name, cur, sel, size, pos: { x: 0, y: 0 } };
}
const andrei = makeActor('Andrei');
const nathan = makeActor('Nathan', '#9747ff');
const george = makeActor('George', '#14ae5c');
const actors = [andrei, nathan, george];

function place(a, x, y) {
  a.pos.x = x; a.pos.y = y;
  a.cur.style.transform = `translate(${x}px, ${y}px)`;
}

async function move(a, x, y, ms, id, easing = 'cubic-bezier(0.55, 0, 0.2, 1)') {
  const from = `translate(${a.pos.x}px, ${a.pos.y}px)`;
  const to = `translate(${x}px, ${y}px)`;
  a.pos.x = x; a.pos.y = y;
  const anim = a.cur.animate([{ transform: from }, { transform: to }], { duration: ms, easing, fill: 'forwards' });
  await anim.finished.catch(() => {});
  a.cur.style.transform = to;
  anim.cancel();
  alive(id);
}

async function click(a, id) {
  a.cur.classList.add('is-down');
  await wait(80, id);
  a.cur.classList.remove('is-down');
}

// the toolbar follows Andrei (it's his screen)
function tool(name) {
  Object.values(tools).forEach((t) => t.classList.toggle('is-active', t === tools[name]));
}

function setSelect(a, b, label, smooth = false) {
  a.sel.classList.toggle('is-smooth', smooth);
  Object.assign(a.sel.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` });
  a.size.textContent = label ?? `${Math.round(b.w)} × ${Math.round(b.h)}`;
  a.sel.classList.add('is-on');
}
const hideSelect = (a) => a.sel.classList.remove('is-on');

// Drag out a rectangle from b's top-left to its bottom-right, cursor in lockstep.
async function drawRect(a, b, ms, id) {
  const clipped = clipToView(b);
  await move(a, clipped.x, clipped.y, 300, id);
  a.cur.classList.add('is-down');
  const t0 = performance.now();
  await new Promise((res) => {
    const step = (now) => {
      if (id !== run) return res();
      const t = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      const w = clipped.w * e;
      const h = clipped.h * e;
      setSelect(a, { x: clipped.x, y: clipped.y, w, h }, `${Math.round(b.w * e)} × ${Math.round(b.h * e)}`);
      place(a, clipped.x + w, clipped.y + h);
      t < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  });
  alive(id);
  a.cur.classList.remove('is-down');
}

function clipToView(b) {
  const W = landing.clientWidth;
  const H = landing.clientHeight;
  const x = Math.max(12, b.x);
  const y = Math.max(12, b.y);
  return { x, y, w: Math.min(W - 90, b.x + b.w) - x, h: Math.min(H - 60, b.y + b.h) - y };
}

const built = (el) => el.classList.add('is-built');

/* ---------------------------------------------------------------- timeline
   Three tracks run in parallel, then Andrei drops into the badge. */

// Andrei: types the word and adds the motion blur
async function trackWord(id, small) {
  const a = andrei;
  tool('text');
  const wb = box(word);
  const lineTop = wb.y + wb.h * 0.2;
  const lineH = wb.h * 0.66;
  await move(a, wb.x + 4, lineTop + lineH * 0.5, 420, id);
  await click(a, id);
  caret.classList.add('is-on');
  Object.assign(caret.style, { left: `${wb.x}px`, top: `${lineTop}px`, height: `${lineH}px` });
  place(a, wb.x + 18, lineTop + lineH + 6);
  for (const l of letters) {
    const lb = box(l);
    const shown = lb.x + lb.w - wb.x;
    wordMain.style.setProperty('--hide', `${Math.max(0, wb.w - shown)}px`);
    caret.style.left = `${lb.x + lb.w}px`;
    setSelect(a, { x: wb.x, y: wb.y, w: lb.x + lb.w - wb.x, h: wb.h }, 'Bodoni Moda · 500');
    await wait(small ? 45 : 55, id);
  }
  caret.classList.remove('is-on');
  setSelect(a, wb, 'Motion blur', true);
  word.classList.add('has-fx');
  await wait(320, id);
  built(word);
  hideSelect(a);
  tool('move');
}

// Nathan: colour field, year tag and role, then signs the name
async function trackDecor(id, small) {
  const a = nathan;
  const W = landing.clientWidth;
  const H = landing.clientHeight;
  const field = { x: W * (small ? 0.42 : 0.5), y: 20, w: W * (small ? 0.58 : 0.5) - 20, h: H * 0.62 };
  await drawRect(a, field, 380, id);
  blobs.forEach((b) => b.classList.add('is-drawn', 'is-built'));
  await wait(40, id);
  blobs.forEach((b) => b.classList.remove('is-drawn')); // blur(0) → blur(70px)
  setSelect(a, clipToView(field), 'Layer blur 70');
  await wait(260, id);

  await drawRect(a, box(year), 220, id);
  built(year);
  if (visible(role)) {
    const rb = box(role);
    await move(a, rb.x, rb.y + rb.h, 260, id);
    built(role);
    setSelect(a, rb, undefined, true);
    await wait(160, id);
  }

  const sb = box(sign);
  await move(a, sb.x, sb.y + sb.h * 0.7, 300, id);
  hideSelect(a);
  built(sign);
  await move(a, sb.x + sb.w, sb.y + sb.h * 0.25, 650, id, 'cubic-bezier(0.45, 0, 0.25, 1)');
  setSelect(a, sb, undefined, true);
  await wait(160, id);
  hideSelect(a);
}

// George: the link row, then the comment pin on the name
async function trackLinks(id) {
  const a = george;
  await wait(200, id);
  const first = links[0];
  const fb = box(first);
  await move(a, fb.x + fb.w * 0.5, fb.y + fb.h * 0.5, 420, id);
  built(first);
  setSelect(a, fb, undefined, true);
  const wb = box(word);
  const gap = Math.round(fb.y - (wb.y + wb.h));
  if (gap > 30) {
    Object.assign(measure.style, { left: `${fb.x + fb.w * 0.5}px`, top: `${wb.y + wb.h}px`, height: `${gap}px` });
    measureLabel.textContent = gap;
    measure.classList.add('is-on');
  }
  await wait(240, id);
  for (const l of links.slice(1)) {
    const lb = box(l);
    l.style.transition = 'none';
    l.style.transform = `translate(${fb.x - lb.x}px, ${fb.y - lb.y}px)`;
    l.getBoundingClientRect();
    l.style.transition = '';
    built(l);
    l.style.transform = '';
    setSelect(a, lb, undefined, true);
    await move(a, lb.x + lb.w * 0.5, lb.y + lb.h * 0.5, 240, id);
  }
  measure.classList.remove('is-on');
  hideSelect(a);

  const pb = box(pop);
  await move(a, pb.x + pb.h * 0.5, pb.y + pb.h * 0.5, 420, id);
  await click(a, id);
  built(pop);
  await wait(200, id);
  await move(a, pb.x - 40, pb.y + pb.h + 50, 380, id);
}

async function build(id) {
  const W = landing.clientWidth;
  const H = landing.clientHeight;
  const small = W < 560;

  // everyone joins the file from different corners
  place(andrei, W * 0.72, H * 0.82);
  place(nathan, W * 0.92, H * 0.12);
  place(george, W * 0.12, H * 0.86);
  fig.classList.add('show-grid', 'show-chrome');
  await wait(150, id);
  actors.forEach((a) => a.cur.classList.add('is-on'));
  tool('move');
  await wait(150, id);

  await Promise.all([trackWord(id, small), trackDecor(id, small), trackLinks(id)]);

  // Nathan and George leave; Andrei drops into the badge and becomes the glossy pointer (ref 4)
  nathan.cur.classList.remove('is-on');
  george.cur.classList.remove('is-on');
  const bb = box(badge);
  built(badge);
  await move(andrei, bb.x + bb.w * 0.5, bb.y + bb.h * 0.5, 480, id);
  setSelect(andrei, bb, undefined, true);
  badge.classList.add('has-cursor');
  andrei.cur.classList.remove('is-on');
  await wait(320, id);

  finish();
}

/* ------------------------------------------------------------ start / skip */

function finish() {
  run++;
  actors.forEach((a) => { hideSelect(a); a.cur.classList.remove('is-on', 'is-down'); });
  caret.classList.remove('is-on');
  measure.classList.remove('is-on');
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
initSecrets();

/* ------------------------------------------------------------ idle hint
   If someone lingers on the landing page, nudge them toward the dino game.
   Shows once per visit, after ~18s without any activity, once the build is done. */
(() => {
  const hint = $('[data-idle-hint]');
  if (!hint) return;
  const IDLE_MS = 18000;
  let timer = 0;
  let shown = false;

  const hide = () => {
    if (hint.hidden) return;
    hint.classList.remove('is-on');
    setTimeout(() => { hint.hidden = true; }, 350);
  };
  const show = () => {
    if (shown || root.classList.contains('is-building') || document.querySelector('.dino')) { arm(); return; }
    shown = true;
    hint.hidden = false;
    requestAnimationFrame(() => hint.classList.add('is-on'));
  };
  function arm() {
    clearTimeout(timer);
    if (!shown) timer = setTimeout(show, IDLE_MS);
  }

  ['pointermove', 'pointerdown', 'scroll', 'wheel', 'touchstart'].forEach((t) => window.addEventListener(t, arm, { passive: true }));
  window.addEventListener('keydown', (e) => { if (shown && e.key.length === 1) hide(); arm(); });
  hint.querySelector('[data-idle-close]').addEventListener('click', (e) => { e.stopPropagation(); hide(); });
  // the game window opens in the same corner, so get out of its way
  new MutationObserver(() => { if (document.querySelector('.dino')) hide(); }).observe(document.body, { childList: true });
  arm();
})();

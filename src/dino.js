/**
 * Easter egg — type "dino" anywhere (outside a text field) and a little
 * runner game pops up in a window. Original pixel art: a small stegosaurus
 * with coral back plates, jumping over rocks and cacti (and birds, later).
 *
 * Space / ↑ / tap to jump · Esc to close · best score kept in this browser.
 */

const SECRET = 'dino';
const W = 640, H = 170, GROUND = 140, PX = 3;

// 16×12 sprites. X = body, P = plates/accent, O = eye, . = empty
const BODY = [
  '..........XXXX..',
  '.........XXXXXX.',
  '.........XXOXXXX',
  '..P.P.P..XXXXXXX',
  '.PPPPPPPXXXXXX..',
  'XXXXXXXXXXXXX...',
  'XXXXXXXXXXXXX...',
  '.XXXXXXXXXXXX...',
  '..XXXXXXXXXX....',
];
const LEGS = {
  a:    ['..XX......XX....', '..XX.......XX...', '..XXX......XXX..'],
  b:    ['...XX....XX.....', '..XX......XX....', '.XXX.....XXX....'],
  air:  ['..XX.....XX.....', '...XX....XX.....', '................'],
};
const BIRD = [
  ['X.........', 'XX.....XX.', '.XXXXXXXXX', '..XXXXXX..', '..........'],
  ['..........', '...XXXXX..', 'XXXXXXXXXX', '.XX....XX.', 'X........X'],
];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let typed = '';
let game = null;

export function initDino() {
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    const t = e.target;
    if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    typed = (typed + e.key.toLowerCase()).slice(-SECRET.length);
    if (typed === SECRET) { typed = ''; open(); }
  });
}

function open() {
  if (game) { game.win.classList.add('is-nudge'); setTimeout(() => game.win.classList.remove('is-nudge'), 400); return; }
  game = createGame();
}

function createGame() {
  const win = document.createElement('section');
  win.className = 'dino';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Secret dino game');
  win.innerHTML = `
    <header class="dino-head">
      <span class="dino-dots">
        <button type="button" class="dino-close" aria-label="Close game"></button>
        <i aria-hidden="true"></i><i aria-hidden="true"></i>
      </span>
      <span class="dino-title">dino.exe</span>
    </header>
    <canvas class="dino-canvas" width="${W * 2}" height="${H * 2}" tabindex="0" aria-label="Runner game. Press space to jump."></canvas>
    <footer class="dino-foot">Space / ↑ / tap to jump · Esc to close</footer>`;
  document.body.appendChild(win);
  requestAnimationFrame(() => win.classList.add('is-open'));

  const canvas = win.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  ctx.imageSmoothingEnabled = false;
  canvas.focus({ preventScroll: true });

  let best = 0;
  try { best = Number(localStorage.getItem('dino-best')) || 0; } catch { /* storage blocked */ }

  const state = {
    mode: 'ready', // ready | run | over
    y: 0, vy: 0, t: 0, speed: 6, score: 0,
    obstacles: [], nextIn: 60, clouds: [], groundX: 0,
  };
  let colors = readColors();
  let raf = 0, last = performance.now(), frame = 0;

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    return {
      ink: cs.getPropertyValue('--ink').trim() || '#111',
      bg: cs.getPropertyValue('--bg').trim() || '#fff',
      muted: cs.getPropertyValue('--faint').trim() || '#999',
      accent: cs.getPropertyValue('--coral').trim() || '#ff6a5c',
    };
  }

  function reset() {
    Object.assign(state, { mode: 'run', y: 0, vy: 0, t: 0, speed: 6, score: 0, obstacles: [], nextIn: 50 });
  }

  function jump() {
    if (state.mode === 'ready' || state.mode === 'over') { reset(); return; }
    if (state.y === 0) state.vy = 10.5;
  }

  function spawn() {
    const birdsUnlocked = state.score > 350;
    if (birdsUnlocked && Math.random() < 0.25) {
      const high = Math.random() < 0.5;
      state.obstacles.push({ kind: 'bird', x: W + 20, w: 10 * PX, h: 5 * PX, y: GROUND - (high ? 62 : 34) });
    } else {
      const kind = Math.random() < 0.45 ? 'rock' : 'cactus';
      const count = Math.random() < 0.3 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const w = kind === 'rock' ? 22 + Math.random() * 10 : 12;
        const h = kind === 'rock' ? 14 + Math.random() * 6 : 26 + Math.random() * 16;
        state.obstacles.push({ kind, x: W + 20 + i * (w + 6), w, h, y: GROUND - h });
      }
    }
    state.nextIn = 45 + Math.random() * 55 - Math.min(25, state.speed * 1.5);
  }

  function update(dt) {
    if (state.mode !== 'run') return;
    state.t += dt;
    state.speed = Math.min(15, 6 + state.score / 180);
    state.score += dt * 0.35 * (state.speed / 6);
    state.groundX = (state.groundX - state.speed * dt) % 24;

    // jump physics
    state.vy -= 0.62 * dt;
    state.y = Math.max(0, state.y + state.vy * dt);
    if (state.y === 0 && state.vy < 0) state.vy = 0;

    state.nextIn -= dt * (state.speed / 6);
    if (state.nextIn <= 0) spawn();
    for (const o of state.obstacles) o.x -= state.speed * dt * (o.kind === 'bird' ? 1.15 : 1);
    state.obstacles = state.obstacles.filter((o) => o.x + o.w > -10);

    // collision (slightly forgiving hitbox)
    const dx = 40, dy = GROUND - state.y - 12 * PX;
    const box = { x: dx + 6, y: dy + 6, w: 16 * PX - 14, h: 12 * PX - 8 };
    for (const o of state.obstacles) {
      if (box.x < o.x + o.w - 3 && box.x + box.w > o.x + 3 && box.y < o.y + o.h - 2 && box.y + box.h > o.y + 2) {
        state.mode = 'over';
        if (state.score > best) {
          best = Math.floor(state.score);
          try { localStorage.setItem('dino-best', String(best)); } catch { /* ignore */ }
        }
      }
    }
  }

  function sprite(rows, x, y, map) {
    rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const col = map[row[c]];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(x + c * PX, y + r * PX, PX + 0.4, PX + 0.4); // overlap hides scaling seams
      }
    });
  }

  function draw() {
    if (frame % 30 === 0) colors = readColors();
    const { ink, bg, muted, accent } = colors;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ground line with pebbles
    ctx.fillStyle = ink;
    ctx.fillRect(0, GROUND, W, 1.5);
    ctx.fillStyle = muted;
    for (let x = state.groundX; x < W; x += 24) {
      ctx.fillRect(x + 4, GROUND + 6, 3, 1.5);
      ctx.fillRect(x + 15, GROUND + 11, 2, 1.5);
    }

    // obstacles
    for (const o of state.obstacles) {
      if (o.kind === 'bird') {
        sprite(BIRD[Math.floor(state.t / 8) % 2], o.x, o.y, { X: ink });
      } else if (o.kind === 'rock') {
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + o.h);
        ctx.lineTo(o.x + o.w * 0.2, o.y + o.h * 0.25);
        ctx.lineTo(o.x + o.w * 0.55, o.y);
        ctx.lineTo(o.x + o.w * 0.85, o.y + o.h * 0.35);
        ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.fill();
      } else {
        ctx.fillStyle = ink;
        ctx.fillRect(o.x + 3, o.y, 6, o.h);
        ctx.fillRect(o.x - 3, o.y + o.h * 0.35, 4, 3);
        ctx.fillRect(o.x - 3, o.y + o.h * 0.15, 3, o.h * 0.22);
        ctx.fillRect(o.x + 8, o.y + o.h * 0.5, 4, 3);
        ctx.fillRect(o.x + 10, o.y + o.h * 0.3, 3, o.h * 0.22);
      }
    }

    // dino
    const dead = state.mode === 'over';
    const legs = state.y > 0 || state.mode === 'ready' ? LEGS.air : Math.floor(state.t / 5) % 2 ? LEGS.a : LEGS.b;
    const map = { X: ink, P: accent, O: dead ? accent : bg };
    const dx = 40, dy = GROUND - state.y - (BODY.length + legs.length) * PX;
    sprite(BODY, dx, dy, map);
    sprite(state.mode === 'ready' ? LEGS.a : legs, dx, dy + BODY.length * PX, map);

    // score
    ctx.fillStyle = muted;
    ctx.font = '600 12px "Inter Tight", system-ui, sans-serif';
    ctx.textAlign = 'right';
    const pad = (n) => String(Math.floor(n)).padStart(5, '0');
    ctx.fillText(`HI ${pad(best)}   ${pad(state.score)}`, W - 14, 22);

    // messages
    ctx.textAlign = 'center';
    ctx.fillStyle = ink;
    if (state.mode === 'ready') {
      ctx.font = '600 14px "Inter Tight", system-ui, sans-serif';
      ctx.fillText('Press space or tap to start', W / 2, 70);
    } else if (dead) {
      ctx.font = '800 16px "Inter Tight", system-ui, sans-serif';
      ctx.fillText('G A M E   O V E R', W / 2, 64);
      ctx.font = '500 12px "Inter Tight", system-ui, sans-serif';
      ctx.fillStyle = muted;
      ctx.fillText('Space or tap to try again', W / 2, 86);
    }
  }

  function loop(now) {
    const dt = Math.min(3, (now - last) / 16.667);
    last = now;
    frame++;
    update(reduceMotion ? dt * 0.8 : dt);
    draw();
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  const onKey = (e) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === ' ' || e.key === 'ArrowUp' || e.code === 'Space') {
      if (document.activeElement === canvas || win.contains(document.activeElement) || state.mode === 'run') {
        e.preventDefault();
        jump();
      }
    }
  };
  document.addEventListener('keydown', onKey);
  canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); canvas.focus({ preventScroll: true }); jump(); });

  function close() {
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown', onKey);
    win.classList.remove('is-open');
    setTimeout(() => win.remove(), 300);
    game = null;
  }
  win.querySelector('.dino-close').addEventListener('click', close);

  return { win, close };
}

/**
 * Hero gallery — a cluster of photos laid out on a grid rotated ~30°,
 * then bent onto a sphere (radial barrel distortion) in a vertex shader.
 *
 * Tiles are declared in the HTML as buttons (data-u / data-v / data-w / data-h,
 * in a 1440×900 design space, in the rotated frame). Those buttons stay in the
 * DOM for keyboard users and as the no-WebGL fallback.
 */

const DESIGN_W = 1440;
const DESIGN_H = 900;
const ANGLE = (28 * Math.PI) / 180; // rotation of the grid (clockwise on screen)
const HORIZON = 720; // sphere horizon radius in design px
const SEGMENTS = 28;
const CENTER_OFFSET = { x: 8, y: 8 }; // sphere centre vs. viewport centre (design px)
const PAN_LIMIT = { u: 520, v: 380 };
// On-screen extent of the bent cluster above/below its centre, at scale 1.
const CLUSTER_EXTENT = { up: 310, down: 400 };
const CORNER_RADIUS = 16; // design px

const VERT = `
attribute vec2 a_pos;
uniform vec4 u_rect;    // centre u, centre v, width, height (design px)
uniform vec2 u_offset;  // pan + parallax (design px, rotated frame)
uniform float u_angle;
uniform float u_scale;  // css px per design px
uniform float u_spread; // intro: 0.85 -> 1
uniform float u_grow;   // hover
uniform float u_horizon;
uniform vec2 u_res;
uniform vec2 u_center;
uniform vec4 u_uv;
varying vec2 v_uv;
varying vec2 v_local; // position inside the tile, design px from its centre
varying vec2 v_half;  // half the tile size, design px
varying float v_aa;   // ~1 screen px, in design px

void main() {
  vec2 size = u_rect.zw * u_grow * mix(0.92, 1.0, u_spread);
  vec2 local = (a_pos - 0.5) * size;
  v_local = local;
  v_half = size * 0.5;
  v_aa = 1.25 / u_scale;
  vec2 p = (u_rect.xy + u_offset) * u_spread + local;
  float c = cos(u_angle);
  float s = sin(u_angle);
  vec2 q = vec2(p.x * c - p.y * s, p.x * s + p.y * c) * u_scale;
  q = q / sqrt(1.0 + dot(q, q) / (u_horizon * u_horizon));
  vec2 screen = u_center + q;
  vec2 clip = screen / u_res * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_uv = mix(u_uv.xy, u_uv.zw, a_pos);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform float u_alpha;
uniform float u_radius;
varying vec2 v_uv;
varying vec2 v_local;
varying vec2 v_half;
varying float v_aa;
void main() {
  // rounded-rectangle mask (signed distance), anti-aliased over ~1 screen px
  float r = min(u_radius, min(v_half.x, v_half.y));
  vec2 d = abs(v_local) - (v_half - r);
  float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
  float mask = 1.0 - smoothstep(-v_aa, 0.0, dist);
  vec4 c = texture2D(u_tex, v_uv);
  float a = u_alpha * mask;
  gl_FragColor = vec4(c.rgb * a, a);
}`;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 4);

export function initHeroGallery(hero) {
  if (!hero) return;

  const canvas = hero.querySelector('.hero-canvas');
  const cross = hero.querySelector('[data-hero-cross]');
  const counter = hero.querySelector('[data-hero-count]');
  const bar = hero.querySelector('.hero-bar');
  const synopsis = hero.querySelector('.hero-synopsis');
  const buttons = [...hero.querySelectorAll('[data-tile]')];

  const tiles = buttons.map((el) => {
    const [fx, fy] = (el.dataset.focus || '0.5,0.5').split(',').map(Number);
    return {
      el,
      u: +el.dataset.u, v: +el.dataset.v, w: +el.dataset.w, h: +el.dataset.h,
      fx, fy,
      src: el.querySelector('img').currentSrc || el.querySelector('img').src,
      tex: null, uv: [0, 0, 1, 1], alpha: 0, grow: 1,
    };
  });

  const view = { w: 0, h: 0, scale: 1, horizon: HORIZON, cx: 0, cy: 0, dpr: 1 };

  function measure() {
    const rect = hero.getBoundingClientRect();
    view.w = rect.width;
    view.h = rect.height;
    const desktop = Math.min(view.w / DESIGN_W, view.h / DESIGN_H);
    const compact = Math.min(view.w / 720, view.h / 1000, 0.75);
    view.scale = Math.max(desktop, compact);
    view.cx = view.w / 2 + CENTER_OFFSET.x * view.scale;
    view.cy = view.h / 2 + CENTER_OFFSET.y * view.scale;

    // Portrait screens: fit the cluster into the band between the top bar and
    // the synopsis (which sits above the title), so no text lands on a photo.
    if (view.h > view.w * 1.1 && bar && synopsis) {
      const top = bar.getBoundingClientRect().bottom - rect.top + 20;
      const bottom = synopsis.getBoundingClientRect().top - rect.top - 20;
      const avail = Math.max(160, bottom - top);
      const extent = CLUSTER_EXTENT.up + CLUSTER_EXTENT.down;
      view.scale = Math.min(compact, avail / extent);
      view.cy = top + (avail - extent * view.scale) / 2 + CLUSTER_EXTENT.up * view.scale;
    }
    view.horizon = HORIZON * view.scale;
  }

  // Fallback/accessible layout: same rotated grid, without the sphere bend.
  function layoutDom() {
    const s = view.scale;
    tiles.forEach((t) => {
      t.el.style.left = `${view.cx}px`;
      t.el.style.top = `${view.cy}px`;
      t.el.style.width = `${t.w * s}px`;
      t.el.style.height = `${t.h * s}px`;
      t.el.style.transform =
        `translate(-50%, -50%) rotate(${ANGLE}rad) translate(${t.u * s}px, ${t.v * s}px)`;
    });
  }

  measure();
  layoutDom();

  const gl =
    canvas.getContext('webgl2', { antialias: true, premultipliedAlpha: true, alpha: true }) ||
    canvas.getContext('webgl', { antialias: true, premultipliedAlpha: true, alpha: true });

  if (!gl) {
    window.addEventListener('resize', () => { measure(); layoutDom(); });
    return;
  }

  const isGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  const program = createProgram(gl, VERT, FRAG);
  if (!program) return;

  hero.classList.add('has-gl');
  buttons.forEach((b) => b.setAttribute('tabindex', '0'));

  // --- geometry: a subdivided unit quad -------------------------------
  const verts = [];
  const idx = [];
  for (let y = 0; y <= SEGMENTS; y++) {
    for (let x = 0; x <= SEGMENTS; x++) verts.push(x / SEGMENTS, y / SEGMENTS);
  }
  for (let y = 0; y < SEGMENTS; y++) {
    for (let x = 0; x < SEGMENTS; x++) {
      const i = y * (SEGMENTS + 1) + x;
      idx.push(i, i + 1, i + SEGMENTS + 1, i + 1, i + SEGMENTS + 2, i + SEGMENTS + 1);
    }
  }
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

  gl.useProgram(program);
  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['u_rect', 'u_offset', 'u_angle', 'u_scale', 'u_spread', 'u_grow', 'u_horizon',
    'u_res', 'u_center', 'u_uv', 'u_tex', 'u_alpha', 'u_radius'].forEach((n) => {
    U[n] = gl.getUniformLocation(program, n);
  });

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  // --- textures -------------------------------------------------------
  tiles.forEach((t) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (isGL2) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      t.uv = coverUV(img.naturalWidth / img.naturalHeight, t.w / t.h, t.fx, t.fy);
      t.tex = tex;
    };
    img.src = t.src;
  });

  // --- sizing ---------------------------------------------------------
  function resize() {
    measure();
    layoutDom();
    view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(view.w * view.dpr);
    canvas.height = Math.round(view.h * view.dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  new ResizeObserver(resize).observe(hero);

  // --- interaction state ---------------------------------------------
  const pan = { u: 0, v: 0, vu: 0, vv: 0 };
  const parallax = { u: 0, v: 0, tu: 0, tv: 0 };
  const pointer = { x: 0, y: 0, inside: false, down: false, dragging: false, sx: 0, sy: 0, lx: 0, ly: 0, lt: 0, id: null };
  const crossPos = { x: 0, y: 0 };
  let hovered = -1;
  let focused = -1;

  const screenToFrame = (dx, dy) => {
    const c = Math.cos(ANGLE), s = Math.sin(ANGLE);
    return { u: (dx * c + dy * s) / view.scale, v: (-dx * s + dy * c) / view.scale };
  };

  function hitTest(x, y) {
    const dx = x - view.cx, dy = y - view.cy;
    const r2 = (dx * dx + dy * dy) / (view.horizon * view.horizon);
    if (r2 >= 1) return -1;
    const k = 1 / Math.sqrt(1 - r2);
    const p = screenToFrame(dx * k, dy * k);
    const sp = spread;
    for (let i = tiles.length - 1; i >= 0; i--) {
      const t = tiles[i];
      const cu = (t.u + pan.u + parallax.u) * sp;
      const cv = (t.v + pan.v + parallax.v) * sp;
      const hw = (t.w * t.grow) / 2, hh = (t.h * t.grow) / 2;
      if (Math.abs(p.u - cu) <= hw && Math.abs(p.v - cv) <= hh) return i;
    }
    return -1;
  }

  const local = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const p = local(e);
    Object.assign(pointer, { down: true, dragging: false, sx: p.x, sy: p.y, lx: p.x, ly: p.y, lt: performance.now(), id: e.pointerId });
    pan.vu = pan.vv = 0;
  });

  canvas.addEventListener('pointermove', (e) => {
    const p = local(e);
    pointer.x = p.x; pointer.y = p.y; pointer.inside = true;

    if (pointer.down) {
      if (!pointer.dragging && Math.hypot(p.x - pointer.sx, p.y - pointer.sy) > 5) {
        pointer.dragging = true;
        hero.classList.add('is-dragging');
        try { canvas.setPointerCapture(pointer.id); } catch (_) { /* noop */ }
      }
      if (pointer.dragging) {
        const now = performance.now();
        const d = screenToFrame(p.x - pointer.lx, p.y - pointer.ly);
        pan.u = rubber(pan.u + d.u, PAN_LIMIT.u);
        pan.v = rubber(pan.v + d.v, PAN_LIMIT.v);
        const dt = Math.max(1, now - pointer.lt);
        pan.vu = lerp(pan.vu, (d.u / dt) * 16, 0.5);
        pan.vv = lerp(pan.vv, (d.v / dt) * 16, 0.5);
        pointer.lx = p.x; pointer.ly = p.y; pointer.lt = now;
      }
    }

    if (!reduceMotion) {
      const d = screenToFrame(p.x - view.cx, p.y - view.cy);
      parallax.tu = -d.u * 0.035;
      parallax.tv = -d.v * 0.035;
    }
  });

  // Open tiles from `click`, not `pointerup`: on touch, the browser's follow-up
  // click would otherwise land on the freshly opened lightbox and close it.
  let suppressClick = false;
  let lastDrag = 0;
  const endPointer = () => {
    if (!pointer.down) return;
    lastDrag = performance.now();
    suppressClick = pointer.dragging;
    pointer.down = false;
    pointer.dragging = false;
    hero.classList.remove('is-dragging');
  };
  canvas.addEventListener('click', (e) => {
    if (suppressClick) { suppressClick = false; return; }
    const p = local(e);
    const hit = hitTest(p.x, p.y);
    if (hit > -1) tiles[hit].el.click();
  });
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('pointerleave', () => {
    pointer.inside = false;
    parallax.tu = parallax.tv = 0;
  });

  buttons.forEach((b, i) => {
    b.addEventListener('focus', () => { focused = i; });
    b.addEventListener('blur', () => { if (focused === i) focused = -1; });
  });

  // --- render loop ----------------------------------------------------
  let spread = reduceMotion ? 1 : 0;
  const start = performance.now();
  let visible = true;
  let last = performance.now();
  let lastCount = '';

  new IntersectionObserver(([entry]) => {
    const was = visible;
    visible = entry.isIntersecting;
    if (visible && !was) { last = performance.now(); requestAnimationFrame(frame); }
  }).observe(hero);

  function frame(now) {
    if (!visible) return;
    const dt = Math.min(64, now - last) / 16.667;
    last = now;

    spread = reduceMotion ? 1 : easeOut(clamp((now - start - 150) / 1600, 0, 1));

    // inertia + soft return inside limits
    if (!pointer.dragging) {
      pan.u += pan.vu * dt;
      pan.v += pan.vv * dt;
      pan.vu *= Math.pow(0.92, dt);
      pan.vv *= Math.pow(0.92, dt);
      if (Math.abs(pan.u) > PAN_LIMIT.u) pan.u = lerp(pan.u, Math.sign(pan.u) * PAN_LIMIT.u, 0.15 * dt);
      if (Math.abs(pan.v) > PAN_LIMIT.v) pan.v = lerp(pan.v, Math.sign(pan.v) * PAN_LIMIT.v, 0.15 * dt);
      // drift back to the resting composition once the gallery has been left alone
      if (now - lastDrag > 2500) {
        pan.u = lerp(pan.u, 0, 0.025 * dt);
        pan.v = lerp(pan.v, 0, 0.025 * dt);
      }
    }
    parallax.u = lerp(parallax.u, parallax.tu, 0.06 * dt);
    parallax.v = lerp(parallax.v, parallax.tv, 0.06 * dt);

    hovered = pointer.inside && !pointer.dragging ? hitTest(pointer.x, pointer.y) : -1;
    const active = hovered > -1 ? hovered : focused;

    // crosshair follows the pointer; rests at the centre otherwise
    const tx = pointer.inside ? pointer.x : view.cx;
    const ty = pointer.inside ? pointer.y : view.cy;
    crossPos.x = lerp(crossPos.x || view.cx, tx, pointer.inside ? 0.35 : 0.08);
    crossPos.y = lerp(crossPos.y || view.cy, ty, pointer.inside ? 0.35 : 0.08);
    cross.style.transform = `translate3d(${crossPos.x}px, ${crossPos.y}px, 0)`;
    cross.classList.toggle('is-over', hovered > -1);

    const count = String((active > -1 ? active : 0) + 1).padStart(2, '0');
    if (count !== lastCount && counter) { counter.textContent = count; lastCount = count; }

    // draw
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.u_angle, ANGLE);
    gl.uniform1f(U.u_scale, view.scale);
    gl.uniform1f(U.u_spread, spread);
    gl.uniform1f(U.u_horizon, view.horizon);
    gl.uniform2f(U.u_res, view.w, view.h);
    gl.uniform2f(U.u_center, view.cx, view.cy);
    gl.uniform2f(U.u_offset, pan.u + parallax.u, pan.v + parallax.v);
    gl.uniform1i(U.u_tex, 0);
    gl.uniform1f(U.u_radius, CORNER_RADIUS);
    gl.activeTexture(gl.TEXTURE0);

    tiles.forEach((t, i) => {
      if (!t.tex) return;
      const delay = i * 0.12;
      const targetAlpha = reduceMotion ? 1 : clamp((spread - delay) / (1 - delay + 0.0001) * 1.6, 0, 1);
      t.alpha = lerp(t.alpha, targetAlpha, 0.2 * dt);
      t.grow = lerp(t.grow, i === active ? 1.035 : 1, 0.12 * dt);
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.uniform4f(U.u_rect, t.u, t.v, t.w, t.h);
      gl.uniform4f(U.u_uv, t.uv[0], t.uv[1], t.uv[2], t.uv[3]);
      gl.uniform1f(U.u_grow, t.grow);
      gl.uniform1f(U.u_alpha, t.alpha);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function rubber(value, limit) {
  const over = Math.abs(value) - limit;
  if (over <= 0) return value;
  return Math.sign(value) * (limit + over * 0.35);
}

function coverUV(imgAspect, tileAspect, fx, fy) {
  if (imgAspect > tileAspect) {
    const w = tileAspect / imgAspect;
    const u0 = clamp(fx - w / 2, 0, 1 - w);
    return [u0, 0, u0 + w, 1];
  }
  const h = imgAspect / tileAspect;
  const v0 = clamp(fy - h / 2, 0, 1 - h);
  return [0, v0, 1, v0 + h];
}

function createProgram(gl, vsSrc, fsSrc) {
  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

/**
 * Hidden extras, on every page:
 *  - A hello for anyone who opens the browser console.
 *  - Edit mode: type "edit" or ↑ ↑ ↓ ↓ ← → ← → B A and the page's text becomes
 *    editable, Figma-style. Changes are only on your screen and reset on refresh.
 */

const EDITABLE = 'h1, h2, h3, h4, p, li, dt, dd, figcaption, .fd-name, .ft-tab, .pv-title, .sb-name, .sb-profile-name, .sb-profile-note, .word-main, .sign';
const SKIP = '.fig, .compose, .dino, .edit-bar, .idle-hint, nav, .theme-toggle, button, [aria-hidden="true"]';
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function initSecrets() {
  consoleHello();
  initEditMode();
}

function consoleHello() {
  if (window.__avHello) return;
  window.__avHello = true;
  const art = [
    '    _              _         _ ',
    '   /_\\  _ _  __| |_ _ ___ (_)',
    '  / _ \\| \' \\/ _` | \'_/ -_)| |',
    ' /_/ \\_\\_||_\\__,_|_| \\___||_|',
  ].join('\n');
  const pink = 'color:#f0386b;font-weight:700;font-family:monospace;font-size:13px;line-height:1.2';
  const body = 'color:inherit;font-size:13px;line-height:1.6';
  const link = 'color:#ff6a5c;font-weight:600;font-size:13px';
  console.log(`%c${art}`, pink);
  console.log(
    '%cHey, you’re snooping 👀 I like that.\n%cWant to work together? → %c' + location.origin + '/about',
    body + ';font-weight:600', body, link,
  );
  console.log('%cPsst: type "dino" anywhere. Or try "edit", or ↑ ↑ ↓ ↓ ← → ← → B A.', 'color:#9a9a9a;font-size:12px');
}

function initEditMode() {
  let on = false;
  let bar = null;
  const originals = new Map();
  let typed = '';
  let seq = [];

  const targets = () => [...document.querySelectorAll(EDITABLE)].filter((el) => !el.closest(SKIP) && el.textContent.trim());

  function enter() {
    if (on) return;
    on = true;
    document.documentElement.classList.add('is-editing');
    targets().forEach((el) => {
      if (!originals.has(el)) originals.set(el, el.innerHTML);
      el.contentEditable = 'true';
      el.spellcheck = false;
      el.classList.add('is-editable');
    });
    showBar();
  }

  function exit() {
    if (!on) return;
    on = false;
    document.documentElement.classList.remove('is-editing');
    document.querySelectorAll('.is-editable').forEach((el) => {
      el.removeAttribute('contenteditable');
      el.classList.remove('is-editable');
    });
    document.activeElement?.blur?.();
    bar?.classList.remove('is-on');
  }

  function resetText() {
    originals.forEach((html, el) => { el.innerHTML = html; });
  }

  function showBar() {
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'edit-bar';
      bar.setAttribute('role', 'status');
      bar.innerHTML = `
        <span class="edit-bar-dot" aria-hidden="true"></span>
        <span class="edit-bar-text"><b>Edit mode</b> Click any text to rewrite it. Only you can see this, and it resets on refresh.</span>
        <button type="button" data-edit-reset>Reset</button>
        <button type="button" class="edit-bar-done" data-edit-done>Done <kbd>Esc</kbd></button>`;
      document.body.appendChild(bar);
      bar.querySelector('[data-edit-reset]').addEventListener('click', resetText);
      bar.querySelector('[data-edit-done]').addEventListener('click', exit);
    }
    requestAnimationFrame(() => bar.classList.add('is-on'));
  }

  // "portfolio" has blurred copies behind it for the motion smear; keep them in step
  document.addEventListener('input', (e) => {
    const main = e.target.closest?.('.word-main');
    if (!main) return;
    main.parentElement.querySelectorAll('.word-ghost').forEach((g) => { g.textContent = main.textContent; });
  });

  // Typing past the edge of the screen: undo the extra text and leave a Figma comment.
  const lastGood = new WeakMap();
  let note = null;
  let noteTimer = 0;
  const EDGE = 8;
  const overflows = (el) => {
    const r = el.getBoundingClientRect();
    return r.right > window.innerWidth - EDGE || r.left < EDGE;
  };
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest?.('.is-editable');
    if (el) lastGood.set(el, el.innerHTML);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest?.('.is-editable');
    if (!el) return;
    if (!overflows(el)) { lastGood.set(el, el.innerHTML); return; }
    if (lastGood.has(el)) {
      el.innerHTML = lastGood.get(el);
      const main = el.closest('.word-main');
      if (main) main.parentElement.querySelectorAll('.word-ghost').forEach((g) => { g.textContent = main.textContent; });
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    tooMuch(el);
  });

  function tooMuch(el) {
    if (!note) {
      note = document.createElement('div');
      note.className = 'edit-note';
      note.setAttribute('role', 'status');
      note.innerHTML = '<span class="edit-note-pin" aria-hidden="true">A</span><span class="edit-note-bubble"><b>Andrei</b><span>okay that’s too much now.</span></span>';
      document.body.appendChild(note);
    }
    const r = el.getBoundingClientRect();
    const w = note.offsetWidth || 230;
    const h = note.offsetHeight || 60;
    const x = Math.min(window.innerWidth - w - 12, Math.max(12, r.right - w * 0.6));
    const y = Math.max(12, Math.min(window.innerHeight - h - 12, r.top - h - 6));
    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    note.classList.remove('is-on');
    void note.offsetWidth;
    note.classList.add('is-on');
    el.classList.remove('is-maxed');
    void el.offsetWidth;
    el.classList.add('is-maxed');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { note.classList.remove('is-on'); el.classList.remove('is-maxed'); }, 2600);
  }

  // links shouldn't navigate while you're editing their text
  document.addEventListener('click', (e) => {
    if (on && e.target.closest('.is-editable') && e.target.closest('a')) e.preventDefault();
  }, true);

  document.addEventListener('keydown', (e) => {
    if (on && e.key === 'Escape') { exit(); return; }
    const t = e.target;
    if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
    if (seq.join() === KONAMI.join()) { seq = []; on ? exit() : enter(); return; }

    if (e.key.length === 1) {
      typed = (typed + e.key.toLowerCase()).slice(-4);
      if (typed === 'edit') { typed = ''; on ? exit() : enter(); }
    }
  });
}

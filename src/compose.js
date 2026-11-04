/**
 * Contact — a Gmail-style "New Message" window that pops up in the corner.
 * Any element with [data-compose] opens it (links keep a mailto: fallback).
 * Sends through Formspree, same endpoint as the old contact form.
 */

const ENDPOINT = 'https://formspree.io/f/xzzgbobv';
const TO = 'andreivergara@outlook.co.nz';
const SUBJECT = 'Hello from your portfolio';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const icon = {
  min: '<svg viewBox="0 0 24 24"><path d="M6 18h12"/></svg>',
  max: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>',
};

function build() {
  const el = document.createElement('section');
  el.className = 'compose';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'false');
  el.setAttribute('aria-labelledby', 'compose-title');
  el.hidden = true;
  el.innerHTML = `
    <header class="compose-head">
      <h2 id="compose-title">New Message</h2>
      <div class="compose-actions">
        <button type="button" data-c="min" aria-label="Minimise">${icon.min}</button>
        <button type="button" data-c="max" aria-label="Full screen">${icon.max}</button>
        <button type="button" data-c="close" aria-label="Close">${icon.close}</button>
      </div>
    </header>
    <form class="compose-body" action="${ENDPOINT}" method="POST" novalidate>
      <div class="compose-row">
        <span class="compose-label">To</span>
        <span class="compose-chip"><span class="compose-avatar" aria-hidden="true">A</span>Andrei Vergara</span>
        <span class="sr-only">${TO}</span>
      </div>
      <label class="compose-row">
        <span class="compose-label">From</span>
        <input type="email" name="email" required autocomplete="email" placeholder="your@email.com">
      </label>
      <label class="compose-row">
        <span class="sr-only">Subject</span>
        <input type="text" name="_subject" data-subject placeholder="Subject" autocomplete="off">
      </label>
      <label class="compose-msg">
        <span class="sr-only">Message</span>
        <textarea name="message" rows="7" placeholder="Hi Andrei, I’d love to chat about…"></textarea>
      </label>
      <input type="text" name="_gotcha" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="compose-status" role="status" aria-live="polite" data-status></p>
      <footer class="compose-foot">
        <button type="submit" class="compose-send">Send</button>
        <button type="button" class="compose-trash" data-c="close" aria-label="Discard draft">${icon.trash}</button>
      </footer>
    </form>`;
  document.body.appendChild(el);
  return el;
}

export function initCompose() {
  const triggers = document.querySelectorAll('[data-compose]');
  if (!triggers.length) return;

  const win = build();
  const form = win.querySelector('form');
  const from = form.querySelector('input[type="email"]');
  const subject = form.querySelector('[data-subject]');
  const message = form.querySelector('textarea');
  const status = form.querySelector('[data-status]');
  const send = form.querySelector('.compose-send');
  let lastFocus = null;
  let typing = 0;

  const setStatus = (text, state) => {
    status.textContent = text;
    status.dataset.state = state || '';
  };

  // The subject line types itself in, like a draft being written.
  function typeSubject() {
    const id = ++typing;
    if (subject.value) return;
    if (reduceMotion) { subject.value = SUBJECT; return; }
    let i = 0;
    const tick = () => {
      if (id !== typing || document.activeElement === subject) return;
      subject.value = SUBJECT.slice(0, ++i);
      if (i < SUBJECT.length) setTimeout(tick, 34 + Math.random() * 40);
    };
    setTimeout(tick, 380);
  }

  function open(trigger) {
    lastFocus = trigger || document.activeElement;
    win.hidden = false;
    win.classList.remove('is-min');
    win.getBoundingClientRect(); // start the slide-up from off-screen
    requestAnimationFrame(() => win.classList.add('is-open'));
    typeSubject();
    setTimeout(() => from.focus({ preventScroll: true }), reduceMotion ? 0 : 260);
  }

  function close() {
    typing++;
    win.classList.remove('is-open', 'is-max');
    const done = () => { win.hidden = true; };
    reduceMotion ? done() : setTimeout(done, 300);
    lastFocus?.focus?.({ preventScroll: true });
  }

  triggers.forEach((t) => t.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    win.hidden || !win.classList.contains('is-open') ? open(t) : (win.classList.remove('is-min'), from.focus());
  }));

  win.querySelector('.compose-head').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-c]');
    if (!btn) { if (win.classList.contains('is-min')) win.classList.remove('is-min'); return; }
    const c = btn.dataset.c;
    if (c === 'min') win.classList.toggle('is-min');
    if (c === 'max') { win.classList.remove('is-min'); win.classList.toggle('is-max'); }
    if (c === 'close') close();
  });
  win.querySelector('.compose-trash').addEventListener('click', () => { form.reset(); setStatus(''); close(); });

  win.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) form.requestSubmit();
  });
  from.addEventListener('input', () => { from.classList.remove('is-invalid'); if (status.dataset.state === 'error') setStatus(''); });
  subject.addEventListener('focus', () => { typing++; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!from.checkValidity() || !from.value) {
      from.classList.add('is-invalid');
      setStatus('Add your email so I can write back.', 'error');
      from.focus();
      return;
    }
    if (!subject.value) subject.value = SUBJECT;
    if (!message.value.trim()) message.value = 'Wants to connect — sent from the portfolio.';
    send.disabled = true;
    send.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Request failed');
      form.reset();
      setStatus('Message sent. I’ll get back to you soon.', 'success');
      win.classList.add('is-sent');
      setTimeout(() => { win.classList.remove('is-sent'); setStatus(''); close(); }, 2200);
    } catch {
      setStatus(`Couldn’t send. Email me directly at ${TO}`, 'error');
    } finally {
      send.disabled = false;
      send.textContent = 'Send';
    }
  });
}

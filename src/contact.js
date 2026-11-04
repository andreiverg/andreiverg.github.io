import './page.js';

/**
 * Contact postcard — flip it to write on the back, then "post" it.
 * Sends through Formspree (same endpoint as the email window).
 */
const pc = document.querySelector('[data-postcard]');
if (pc) {
  const card = pc.querySelector('.pc-card');
  const form = pc.querySelector('[data-form]');
  const front = pc.querySelector('.pc-front');
  const status = pc.querySelector('[data-status]');
  const send = pc.querySelector('[data-send]');
  const sent = document.querySelector('[data-sent]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));

  // today's date in the postmark
  const date = pc.querySelector('[data-pm-date]');
  if (date) date.textContent = new Date().toLocaleDateString('en-NZ', { day: '2-digit', month: 'short' }).toUpperCase();

  const setFlipped = (on) => {
    pc.classList.toggle('is-flipped', on);
    front.setAttribute('aria-hidden', String(on));
    form.setAttribute('aria-hidden', String(!on));
    form.inert = !on;
    front.inert = on;
    if (on) setTimeout(() => form.querySelector('textarea').focus({ preventScroll: true }), reduce ? 0 : 650);
  };
  setFlipped(location.hash === '#write');
  pc.querySelectorAll('[data-flip]').forEach((b) => b.addEventListener('click', () => setFlipped(!pc.classList.contains('is-flipped'))));

  const say = (t, state) => { status.textContent = t; status.dataset.state = state || ''; };
  form.addEventListener('input', () => { if (status.dataset.state === 'error') say(''); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = form.querySelector('textarea');
    const email = form.querySelector('input[type="email"]');
    if (!msg.value.trim()) { say('Your postcard is blank, write a few words first.', 'error'); msg.focus(); return; }
    if (!email.value || !email.checkValidity()) { say('Add your email so I can write back.', 'error'); email.focus(); return; }

    send.disabled = true;
    send.textContent = 'Posting…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Request failed');
      pc.classList.add('is-stamped');      // postmark thumps down
      await wait(700);
      pc.classList.add('is-posted');       // card flies off
      await wait(750);
      pc.hidden = true;
      sent.hidden = false;
      form.reset();
      say('');
    } catch {
      say('Couldn’t send. Email me directly at andreivergara@outlook.co.nz', 'error');
    } finally {
      send.disabled = false;
      send.innerHTML = 'Send postcard <span aria-hidden="true">→</span>';
    }
  });

  sent.querySelector('[data-again]').addEventListener('click', () => {
    sent.hidden = true;
    pc.hidden = false;
    pc.classList.remove('is-stamped', 'is-posted');
    setFlipped(true);
  });
}

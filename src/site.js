/** Shared page behaviour: reveal-on-scroll, lightbox, contact form, footer year. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  items.forEach((el) => observer.observe(el));

  // Safety net for throttled tabs: never leave on-screen content invisible.
  window.addEventListener('load', () => {
    setTimeout(() => {
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
      });
    }, 1200);
  });
}

export function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const media = document.getElementById('lightbox-media');
  const closeBtn = document.getElementById('lightbox-close');
  if (!lightbox || !media || !closeBtn) return;

  let lastFocused = null;

  function open(trigger) {
    const type = trigger.dataset.lightbox;
    const src = trigger.dataset.src;
    media.textContent = '';

    if (type === 'youtube') {
      const iframe = document.createElement('iframe');
      iframe.src = `${src}?autoplay=1&rel=0`;
      iframe.title = 'Video player';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      media.appendChild(iframe);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = trigger.querySelector('img')?.alt || '';
      media.appendChild(img);
    }

    lastFocused = trigger;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    media.textContent = '';
    lastFocused?.focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
    trigger.addEventListener('click', () => open(trigger));
  });
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target === media) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
}

export function initContactForm() {
  const form = document.querySelector('.connect-form');
  const status = document.querySelector('[data-form-status]');
  if (!form || !status) return;

  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  const originalNote = status.innerHTML;
  const originalLabel = button.textContent;

  const setStatus = (html, state) => {
    status.innerHTML = html;
    status.classList.toggle('is-success', state === 'success');
    status.classList.toggle('is-error', state === 'error');
  };

  input.addEventListener('input', () => {
    form.classList.remove('is-invalid');
    if (status.classList.contains('is-error')) setStatus(originalNote);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!input.checkValidity()) {
      form.classList.add('is-invalid');
      setStatus('Please enter a valid email address.', 'error');
      input.focus();
      return;
    }

    button.disabled = true;
    button.textContent = 'Sending';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Request failed');
      form.reset();
      setStatus('Thanks — I’ll be in touch soon.', 'success');
    } catch {
      setStatus('Something went wrong — email me at <a href="mailto:andreivergara@outlook.co.nz">andreivergara@outlook.co.nz</a>', 'error');
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}

export function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

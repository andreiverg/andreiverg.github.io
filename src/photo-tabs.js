/**
 * Photo & Video — a sticky Photos / Videos switch that swaps the galleries
 * and the edits in place. #videography in the URL opens on Videos.
 * Without JS both sections simply show one after the other.
 */
export function initPhotoVideoTabs() {
  const bar = document.querySelector('[data-pv-tabs]');
  if (!bar) return;
  const tabs = [...bar.querySelectorAll('[data-tab]')];
  const panels = tabs.map((t) => document.getElementById(t.dataset.tab));
  const wrap = bar.parentElement;
  document.documentElement.classList.add('has-pv-tabs');

  function select(id, { scroll = false, push = false } = {}) {
    tabs.forEach((t, i) => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
      if (on) {
        bar.style.setProperty('--x', `${t.offsetLeft}px`);
        bar.style.setProperty('--w', `${t.offsetWidth}px`);
      }
    });
    panels.forEach((p) => {
      if (!p.hidden) {
        p.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
        p.classList.remove('pv-enter'); void p.offsetWidth; p.classList.add('pv-enter');
      }
    });
    if (push) history.replaceState(null, '', id === 'videography' ? '#videography' : location.pathname + location.search);
    if (scroll) {
      // jump to the start of the newly shown section (the switch sticks above it)
      // measure from the section, not the switch: a stuck sticky element reports where it's stuck
      const panel = panels[tabs.findIndex((t) => t.dataset.tab === id)];
      const top = panel.getBoundingClientRect().top + window.scrollY - wrap.offsetHeight - 28;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'auto' });
    }
  }

  tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.tab, { scroll: true, push: true })));
  bar.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    select(next.dataset.tab, { push: true });
  });

  // links elsewhere on the site (e.g. "All Photos", /photography#videography)
  const fromHash = () => (location.hash === '#videography' ? 'videography' : 'photography');
  window.addEventListener('hashchange', () => select(fromHash(), { scroll: true }));
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#photography"], a[href="#videography"]');
    if (!a) return;
    e.preventDefault();
    select(a.getAttribute('href').slice(1), { push: true });
    const panel = document.getElementById(a.getAttribute('href').slice(1));
    window.scrollTo({ top: panel.getBoundingClientRect().top + window.scrollY - wrap.offsetHeight - 28, behavior: 'smooth' });
  });

  select(fromHash());
  if (location.hash === '#videography') requestAnimationFrame(() => window.scrollTo(0, panels[1].getBoundingClientRect().top + window.scrollY - wrap.offsetHeight - 28));
  window.addEventListener('resize', () => select(tabs.find((t) => t.getAttribute('aria-selected') === 'true').dataset.tab));
}

/**
 * Light / dark switch. The initial theme is applied by an inline script in
 * <head> (so there's no flash); this wires up the buttons and keeps following
 * the system setting until the visitor picks one.
 */

const KEY = 'theme';
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');

const stored = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const store = (v) => { try { localStorage.setItem(KEY, v); } catch { /* private mode */ } };

function apply(theme) {
  root.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0c0c0d' : '#ffffff';
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    btn.setAttribute('aria-label', `Switch to ${next} mode`);
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
  });
}

export function initTheme() {
  apply(root.dataset.theme === 'dark' ? 'dark' : 'light');
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      store(next);
      apply(next);
    });
  });
  media.addEventListener?.('change', (e) => { if (!stored()) apply(e.matches ? 'dark' : 'light'); });
}

import './page.js';

/**
 * Projects as stacked paper folder tabs. Folders open into their own tabs,
 * files open into a full write-up on the folder's paper, and the path is kept in the URL hash
 * (#capstone/roster-converter) so back/forward and shared links work.
 * The static write-ups in the page stay as the no-JS fallback.
 */

const ICONS = {
  folder: `<svg viewBox="0 0 64 52" aria-hidden="true"><defs><linearGradient id="fd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--peach)"/><stop offset="1" stop-color="var(--coral)"/></linearGradient><linearGradient id="fb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb07a"/><stop offset="1" stop-color="var(--pink)"/></linearGradient></defs><path d="M4 6a4 4 0 0 1 4-4h14l6 6h28a4 4 0 0 1 4 4v4H4z" fill="url(#fb)" opacity=".75"/><rect x="2" y="12" width="60" height="38" rx="5" fill="url(#fd)"/><rect x="2" y="12" width="60" height="5" rx="2.5" fill="#fff" opacity=".28"/></svg>`,
  calendar: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="4" width="56" height="56" rx="14" fill="var(--bg)" stroke="var(--line-strong)"/><rect x="4" y="4" width="56" height="16" rx="14" fill="var(--pink)"/><rect x="4" y="12" width="56" height="8" fill="var(--pink)"/><text x="32" y="47" text-anchor="middle" font-family="Inter Tight, sans-serif" font-weight="600" font-size="22" fill="var(--ink)">.ics</text></svg>`,
  game: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="4" width="56" height="56" rx="14" fill="#1f1b2e"/><g fill="var(--coral)"><rect x="26" y="16" width="12" height="32" rx="2"/><rect x="16" y="26" width="32" height="12" rx="2"/></g><g fill="#fff"><rect x="12" y="12" width="4" height="4"/><rect x="48" y="48" width="4" height="4"/><rect x="48" y="12" width="4" height="4"/></g></svg>`,
  browser: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="8" width="56" height="48" rx="10" fill="var(--bg)" stroke="var(--line-strong)"/><path d="M4 18a10 10 0 0 1 10-10h36a10 10 0 0 1 10 10v2H4z" fill="var(--surface)"/><circle cx="13" cy="14" r="2.2" fill="var(--pink)"/><circle cx="20" cy="14" r="2.2" fill="var(--peach)"/><text x="32" y="45" text-anchor="middle" font-family="Bodoni Moda, Georgia, serif" font-size="20" fill="var(--ink)">.av</text></svg>`,
  glass: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#d9d4ff" stop-opacity=".6"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="#6c63ff" opacity=".85"/><rect x="12" y="14" width="40" height="36" rx="8" fill="url(#gl)" stroke="#fff" stroke-opacity=".8"/><rect x="18" y="22" width="18" height="3" rx="1.5" fill="#6c63ff" opacity=".6"/><rect x="18" y="29" width="26" height="3" rx="1.5" fill="#6c63ff" opacity=".4"/></svg>`,
  link: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 4h26l14 14v38a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill="var(--bg)" stroke="var(--line-strong)"/><path d="M40 4v14h14" fill="var(--surface)" stroke="var(--line-strong)"/><circle cx="32" cy="38" r="11" fill="none" stroke="var(--accent)" stroke-width="2.5"/><path d="M21 38h22M32 27c-4 4-4 18 0 22M32 27c4 4 4 18 0 22" fill="none" stroke="var(--accent)" stroke-width="2"/></svg>`,
};

const TREE = {
  id: '', name: 'Projects', kind: 'folder',
  children: [
    {
      id: 'capstone', name: 'COMPSCI 399 Capstone', kind: 'folder', meta: '3 items',
      note: 'Built with Team 15 (Team SOS) for our client RosterLab in 2026, in two parts: a tool that turns healthcare rosters into personal calendars, and a game for the people in the waiting room.',
      children: [
        {
          id: 'roster-converter', name: 'Roster Converter', kind: 'file', icon: 'calendar', meta: 'Web app',
          tag: 'Part 01 · Capstone',
          body: [
            'A web app that helps healthcare staff move their shifts from a roster into their own calendar. Upload a roster as Excel, CSV or an image, enter your name, and it pulls out your shifts into an editable calendar preview, then exports them as an iCalendar (.ics) file for Google Calendar, Outlook or Apple Calendar.',
            'A rules-based parser handles merged cells, shift codes and weekday-only layouts, and never guesses: unclear names, dates or shift codes come back to the user as questions. When the parser can’t read a roster, an optional AI fallback powered by Google Gemini takes over. Settings and roster history stay in the browser.',
          ],
          stat: ['25 of 28', 'anonymised client rosters parsed without AI, about 89%.'],
          facts: [['Frontend', 'Next.js, React, TypeScript'], ['Backend', 'Python, FastAPI, pandas'], ['AI fallback', 'Google Gemini'], ['Testing', 'Vitest, pytest'], ['Hosting', 'Render']],
          links: [['Try it live', 'https://roster-web-exid.onrender.com/']],
        },
        {
          id: 'triage-please', name: 'Triage, Please', kind: 'file', icon: 'game', meta: 'Browser game',
          tag: 'Part 02 · Capstone',
          body: [
            'A casual, healthcare-themed browser game for patients and visitors in waiting rooms. Players run the front desk of a medical centre: call patients from the queue, read their symptoms and vitals, set a triage priority, and assign each one a room and staff member before the shift ends.',
            'Timed shifts across three difficulties, 20 patient conditions that deteriorate if left waiting, random ethical dilemmas, a guided tutorial with Nurse Lee, and a custom scenario creator with JSON import and export.',
          ],
          aside: 'Inspired by the desk-based gameplay of Papers, Please.',
          facts: [['Stack', 'JavaScript, Vite'], ['Testing', 'Vitest, jsdom'], ['Design', 'Figma, pixel art'], ['Hosting', 'Render']],
          links: [['Play the game', 'https://rosterlab-icu-triage-game-627f.onrender.com/']],
        },
        { id: 'credits', name: 'Team credits', kind: 'link', icon: 'link', meta: 'Website', href: 'https://www.credits.connorknoetze.com/' },
      ],
    },
    {
      id: 'portfolio', name: 'This Portfolio', kind: 'file', icon: 'browser', meta: 'Website',
      tag: 'Design & development',
      body: [
        'A fully custom site, no template. Hand-built in HTML, CSS and JavaScript, with a landing page that builds itself like a live Figma file, a WebGL photo gallery bent onto a sphere, a 3D photo drum, light and dark themes, and a Gmail-style contact window. Bundled with Vite and deployed to Cloudflare.',
      ],
      aside: 'You’re looking at it right now.',
      facts: [['Role', 'Design & development'], ['Stack', 'HTML, CSS, JavaScript, WebGL'], ['Hosting', 'Cloudflare Pages'], ['Status', 'Live']],
      links: [['View source', 'https://github.com/andreiverg/andreiverg.github.io']],
    },
    {
      id: 'glass-ui', name: 'Glass UI', kind: 'file', icon: 'glass', meta: 'Discord theme',
      tag: 'BetterDiscord theme',
      body: [
        'A light, frosted-glass theme for BetterDiscord. Translucent, blurred panels over a background image, a soft monochrome palette in oklch, glass code blocks, and small hover animations for servers, channels, buttons and messages.',
        'Built on the system24 theme by refact0r, then restyled: new colours, glass layers, animations, and fixes that keep the settings window and call screen readable over the blur.',
      ],
      facts: [['Type', 'BetterDiscord theme'], ['Stack', 'CSS'], ['Based on', 'system24 by refact0r'], ['Status', 'Released']],
      links: [['View on GitHub', 'https://github.com/andreiverg/glass-ui']],
    },
  ],
};

// Each inline SVG gets its own gradient ids (a shared id breaks when the first copy is hidden).
let uid = 0;
const uniq = (svg) => { const n = ++uid; return svg.replace(/id="(\w+)"/g, `id="$1-${n}"`).replace(/url\(#(\w+)\)/g, `url(#$1-${n})`); };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Walk "capstone/roster-converter" into [root, capstone, roster]
function resolve(path) {
  const trail = [TREE];
  for (const id of path.split('/').filter(Boolean)) {
    const next = trail.at(-1).children?.find((c) => c.id === id);
    if (!next) break;
    trail.push(next);
  }
  return trail;
}
const pathOf = (trail) => trail.slice(1).map((n) => n.id).join('/');

const mount = document.querySelector('[data-finder]');

/* ------------------------------------------------------------------
   Stacked paper folder tabs (reference 6). Back folders sit higher with
   their tabs further right; the front folder is lowest with its tab on
   the left. Clicking a folder pulls it forward and opens it.
   ------------------------------------------------------------------ */

const firstSentence = (t = '') => (t.match(/^.*?[.!?](\s|$)/) || [t])[0].trim();
const blurb = (n) => n.note ? firstSentence(n.note) : n.kind === 'link' ? 'Opens in a new tab' : firstSentence(n.body?.[0]);
const label = (n) => `( ${n.name.toUpperCase()} )`;

if (mount) {
  document.body.classList.add('has-finder');
  mount.innerHTML = `
    <nav class="ft-crumbs" data-crumbs aria-label="Folder path"></nav>
    <div class="ft-view" data-view aria-live="polite"></div>
    <div class="ft-cover" aria-hidden="true">
      <svg class="ft-flower" viewBox="0 0 100 100"><g fill="currentColor">${[0, 45, 90, 135, 180, 225, 270, 315].map((r) => `<ellipse cx="50" cy="24" rx="11" ry="22" transform="rotate(${r} 50 50)"/>`).join('')}</g></svg>
      <p>Project<br>compilation<br>vol. 1</p>
    </div>`;

  const view = mount.querySelector('[data-view]');
  const crumbs = mount.querySelector('[data-crumbs]');
  const icon = (n) => uniq(n.kind === 'folder' ? ICONS.folder : ICONS[n.icon] || ICONS.link);

  function renderStack(node, trail) {
    const kids = node.children;
    const n = kids.length;
    const folders = kids.map((c, i) => {
      // back-to-front: first child at the back (top, tab far right)
      const tabX = n === 1 ? 0 : ((n - 1 - i) / (n - 1)) * 58;
      const href = c.kind === 'link' ? c.href : `#${pathOf([...trail, c])}`;
      const ext = c.kind === 'link' ? ' target="_blank" rel="noopener noreferrer"' : '';
      const count = c.kind === 'folder' ? `${c.children.length} items` : c.meta;
      return `<a class="ft-folder ft-tone-${i % 2}" href="${href}"${ext} style="--i:${i};--tab-x:${tabX}%;z-index:${i + 1}">
        <span class="ft-tab">${esc(label(c))}${c.kind === 'link' ? ' ↗' : ''}</span>
        <span class="ft-body">
          <span class="ft-blurb">${esc(blurb(c) || '')}</span>
          <span class="ft-count">${esc(count || '')}<i aria-hidden="true">→</i></span>
        </span>
      </a>`;
    }).join('');
    return `${node.note ? `<p class="ft-note">${esc(node.note)}</p>` : ''}<div class="ft-stack" style="--n:${n}">${folders}</div>`;
  }

  function renderSheet(f) {
    const facts = (f.facts || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    const links = (f.links || []).map(([t, u]) => `<a class="fd-btn" href="${u}" target="_blank" rel="noopener noreferrer">${esc(t)} <span aria-hidden="true">↗</span></a>`).join('');
    return `<article class="ft-sheet">
      <span class="ft-tab ft-sheet-tab">${esc(label(f))}</span>
      <div class="ft-paper">
        <header class="ft-sheet-head">
          <span class="ft-sheet-icon">${icon(f)}</span>
          <div>
            <p class="fd-tag">${esc(f.tag || f.meta)}</p>
            <h3>${esc(f.name)}</h3>
          </div>
          <div class="fd-links">${links}</div>
        </header>
        <div class="ft-sheet-cols">
          <div class="fd-file-body">
            ${(f.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}
            ${f.stat ? `<p class="fd-stat"><b>${esc(f.stat[0])}</b> ${esc(f.stat[1])}</p>` : ''}
            ${f.aside ? `<p class="fd-aside">${esc(f.aside)}</p>` : ''}
          </div>
          ${facts ? `<dl class="fd-facts">${facts}</dl>` : ''}
        </div>
      </div>
    </article>`;
  }

  function render(dir) {
    const trail = resolve(location.hash.slice(1));
    const node = trail.at(-1);
    view.innerHTML = node.kind === 'folder' ? renderStack(node, trail) : renderSheet(node);
    crumbs.innerHTML = trail.map((t, i) => {
      const last = i === trail.length - 1;
      return `<a class="ft-crumb${last ? ' is-current' : ''}" href="#${pathOf(trail.slice(0, i + 1))}"${last ? ' aria-current="page"' : ''}>${i === 0 && trail.length > 1 ? '← ' : ''}${esc(label(t))}</a>`;
    }).join('');
    mount.classList.toggle('is-root', trail.length === 1);
    view.classList.remove('is-in', 'is-out');
    void view.offsetWidth;
    view.classList.add(dir === 'out' ? 'is-out' : 'is-in');
  }

  // Navigate with pushState so hash links never scroll the page.
  let lastLen = resolve(location.hash.slice(1)).length;
  const go = (path) => {
    history.pushState(null, '', path ? `#${path}` : location.pathname + location.search);
    const len = resolve(path).length;
    render(len >= lastLen ? 'in' : 'out');
    lastLen = len;
  };
  window.addEventListener('popstate', () => {
    const len = resolve(location.hash.slice(1)).length;
    render(len >= lastLen ? 'in' : 'out');
    lastLen = len;
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  mount.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !mount.contains(a)) return;
    e.preventDefault();
    const path = a.getAttribute('href').slice(1);
    if (path === location.hash.slice(1)) return;
    if (a.classList.contains('ft-folder') && !reduce) {
      // pull the clicked folder forward before opening it
      a.classList.add('is-pulled');
      view.classList.add('is-pulling');
      setTimeout(() => { view.classList.remove('is-pulling'); go(path); }, 380);
    } else {
      go(path);
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.target.closest?.('input, textarea, [contenteditable]')) return;
    if (e.key === 'Backspace' || (e.metaKey && e.key === '[')) {
      const trail = resolve(location.hash.slice(1));
      if (trail.length >= 2) { e.preventDefault(); go(pathOf(trail.slice(0, -1))); }
    }
  });

  render('in');
}

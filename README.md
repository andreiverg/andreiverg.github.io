# Andrei Vergara — Portfolio

My personal portfolio: projects, photography and video, and an about page with my CV. I'm studying Computer Science and Statistics at the University of Auckland, finishing in 2026.

**Live site: [johnvergara.net](https://johnvergara.net/)**

It's a fully custom site with no template, hand-built in HTML, CSS and JavaScript and bundled with Vite.

## Pages

| Page | File | What's on it |
| --- | --- | --- |
| Home | `index.html` | A landing page that builds itself on every visit, as if three people were designing it live in Figma |
| Projects | `projects.html` | Stacked paper folder tabs that open into project write-ups, with each path kept in the URL hash (`#capstone/triage-please`) so links can be shared |
| Photo & Video | `photography.html` | A WebGL photo gallery bent onto a sphere, plus photo galleries and video edits behind a Photos / Videos switch |
| About | `about.html` | CV, a resizable photo, a CV download and links to find me online |

Every page also has light and dark themes, a Gmail-style contact window and a few hidden extras.

## Featured projects

- **Roster Converter** (COMPSCI 399 capstone, for RosterLab): turns healthcare rosters into personal calendar files.
- **Triage, Please** (COMPSCI 399 capstone, for RosterLab): a pixel-art browser game about running a medical centre's front desk.
- **Glass UI**: a frosted-glass theme for BetterDiscord.

## Tech

- **Site:** HTML, CSS and JavaScript, with no UI framework
- **Graphics:** WebGL and CSS 3D
- **Build:** [Vite](https://vite.dev/)
- **Contact form:** [Formspree](https://formspree.io/)
- **Hosting:** Cloudflare Pages

## Running it locally

You'll need Node.js 22 (see `.node-version`).

```bash
git clone https://github.com/andreiverg/andreiverg.github.io.git
cd andreiverg.github.io
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite dev server |
| `npm run build` | Builds the site into `dist/` |
| `npm run preview` | Serves the production build locally |

## Project structure

```
├── index.html            # Home
├── projects.html         # Projects
├── photography.html      # Photo & Video
├── about.html            # About & CV
├── styles.css            # Main stylesheet
├── script.js             # Entry script for Photo & Video
├── src/
│   ├── landing.js/.css   # Self-building landing page
│   ├── projects.js       # Folder tabs and all project content
│   ├── hero-gallery.js   # WebGL sphere gallery
│   ├── connect-ring.js   # 3D photo drum
│   ├── photo-tabs.js     # Photos / Videos switch
│   ├── about.js          # About page behaviour
│   ├── page.js           # Shared setup for Projects and About
│   ├── site.js           # Reveal on scroll, lightbox, footer year
│   ├── compose.js/.css   # Contact window
│   └── theme.js/.css     # Light and dark themes
├── public/               # Copied as is into the build
│   ├── images/           # Photos, project screenshots, favicons
│   ├── files/            # Downloadable CV
│   ├── og.jpg            # Social share preview image
│   └── _headers, _redirects, _routes.json   # Cloudflare config
├── vite.config.js        # Lists each page as a build entry
└── wrangler.toml         # Cloudflare config
```

### Common edits

- **Add or edit a project:** update the `TREE` object in `src/projects.js`. Add a `gallery` to a project to show screenshots. The write-ups in `projects.html` are the no-JavaScript fallback, so keep them in sync.
- **Add a page:** create the HTML file and add it to `rollupOptions.input` in `vite.config.js`.
- **Add images:** put them in `public/images/` and reference them from the site root, for example `/images/work/photo.jpg`.

## Deployment

The site is hosted on Cloudflare Pages:

- **Build command:** `npm run build`
- **Output directory:** `dist`

## Contact

- **Email:** andreivergara@outlook.co.nz
- **LinkedIn:** [John Andrei Vergara](https://www.linkedin.com/in/john-andrei-vergara-3b9921285/)
- **GitHub:** [@andreiverg](https://github.com/andreiverg)

import { initTheme } from './src/theme.js';
import { initCompose } from './src/compose.js';
import { initDino } from './src/dino.js';
import { initHeroGallery } from './src/hero-gallery.js';
import { initConnectRing } from './src/connect-ring.js';
import { initReveal, initLightbox, initContactForm, initFooterYear } from './src/site.js';

initTheme();
initCompose();
initDino();
initHeroGallery(document.querySelector('[data-hero]'));
initConnectRing(document.querySelector('[data-ring-stage]'));
initReveal();
initLightbox();
initContactForm();
initFooterYear();

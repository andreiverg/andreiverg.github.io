import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const page = (name) => resolve(import.meta.dirname, `${name}.html`);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: page('index'),
        projects: page('projects'),
        photography: page('photography'),
        about: page('about'),
        secret: page('secret'),
      },
    },
  },
});

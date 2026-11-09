// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Domínio oficial ainda não definido: configure SITE_URL no deploy.
  site: process.env.SITE_URL ?? 'http://localhost:4321',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});

// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Domínio oficial ainda não definido: configure SITE_URL no deploy.
  site: process.env.SITE_URL ?? 'http://localhost:4321',

  adapter: vercel(),

  env: {
    schema: {
      MICROSOFT_TENANT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      MICROSOFT_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      MICROSOFT_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_MAIL_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_MAIL_TO: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Origens extras aceitas pelo /api/contact, separadas por vírgula (ex.: domínio www e domínio de preview).
      CONTACT_ALLOWED_ORIGINS: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});

// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',

  adapter: node({ mode: 'standalone' }),

  outDir: 'dist/azure',

  env: {
    schema: {
      SITE_INDEXABLE: envField.boolean({ context: 'server', access: 'public', default: false }),
      MICROSOFT_TENANT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      MICROSOFT_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      MICROSOFT_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_MAIL_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_MAIL_TO: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_ALLOWED_ORIGINS: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});

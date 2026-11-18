// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL
      ? 'https://aurionai.com.br'
      : 'http://localhost:4321');

// https://astro.build/config
export default defineConfig({
  // Preferir SITE_URL na Vercel. Em deploy, cai no domínio de produção da Vercel ou em aurionai.com.br.
  site: siteUrl,

  adapter: vercel(),

  env: {
    schema: {
      // Site no ar em aurionai.com.br: indexável por padrão. Para staging, defina SITE_INDEXABLE=false.
      SITE_INDEXABLE: envField.boolean({ context: 'server', access: 'public', default: true }),
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

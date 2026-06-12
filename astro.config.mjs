// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// Interruptor de entorno:
//   TNF_TARGET=prod     → producción: indexable, base '/'
//   TNF_TARGET=staging  → staging en subcarpeta protegida: noindex, base '/staging/'
//   (por defecto: dev)  → local: noindex, base '/'
// Regla de oro (igual que clickcom-web): por defecto NUNCA producción.
const TARGET = process.env.TNF_TARGET || 'dev';
const isProd = TARGET === 'prod';

const SITE_URL = 'https://tenerifecoworking.es';
const BASE = TARGET === 'staging' ? '/staging/' : '/';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: BASE,

  // Slashes al final (coherente con clickcom-web y con el WP que sustituimos)
  trailingSlash: 'always',

  build: {
    // Genera /espacios/index.html en lugar de /espacios.html
    format: 'directory',
  },

  vite: {
    plugins: [tailwindcss()],
    define: {
      // Expuesto al cliente para decidir noindex en el <head>.
      'import.meta.env.TNF_IS_PROD': JSON.stringify(isProd),
    },
  },

  integrations: [
    sitemap({
      // Páginas post-envío (noindex): fuera del sitemap.
      filter: (page) => !page.includes('/gracias/') && !page.includes('/thanks/'),
    }),
    icon({
      include: {
        lucide: ['*'],
      },
    }),
  ],
});

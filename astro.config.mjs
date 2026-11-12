import { defineConfig } from 'astro/config';

// SITE_URL and BASE_PATH are set by the GitHub Pages workflow for the preview deployment.
// Without them the site builds for the root of offsure.com.
export default defineConfig({
  site: process.env.SITE_URL || 'https://offsure.com',
  base: process.env.BASE_PATH || '/',
});

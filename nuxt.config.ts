// https://nuxt.com/docs/api/configuration/nuxt-config
import { siteDescription, siteTitle } from './app/data/siteContent'

// Absolute site URL for the canonical link, link previews, sitemap, robots.txt, llms.txt and JSON-LD.
// Netlify sets URL (the primary domain, also on deploy previews) during builds; NUXT_PUBLIC_SITE_URL overrides it.
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || process.env.URL || 'http://localhost:3000').replace(/\/$/, '')

/*
 * Production only (the dev server's Vite client needs more). Nitro sends them from the server function and,
 * on Netlify, copies them into dist/_headers for the static files, so one list covers every response.
 * The CSP is report-only for now: check the browser console on a deploy preview for violations, then
 * rename it to Content-Security-Policy. 'unsafe-inline' scripts: Nuxt's inline config script (a hash
 * changes with every build); frame-src: the station map (Google Maps, click to load).
 */
const securityHeaders = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'x-frame-options': 'DENY',
  'content-security-policy-report-only': [
    'default-src \'self\'',
    'script-src \'self\' \'unsafe-inline\'',
    'style-src \'self\' \'unsafe-inline\'',
    'img-src \'self\' data: blob:',
    'font-src \'self\'',
    'connect-src \'self\'',
    'frame-src https://maps.google.com https://www.google.com',
    'object-src \'none\'',
    'base-uri \'self\'',
    'form-action \'self\'',
    'frame-ancestors \'none\'',
  ].join('; '),
}

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@vueuse/nuxt', '@nuxt/test-utils/module', '@nuxt/ui', '@nuxt/image'],
  devtools: { enabled: true },
  runtimeConfig: {
    public: { siteUrl },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en-GB' },
      title: siteTitle,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: siteDescription },
        // The brand burgundy (--colour-burgundy in tokens.css; CSS variables can't reach the head): the mobile toolbar
        { name: 'theme-color', content: '#a32638' },
      ],
      link: [
        // The "Worth Valley" sign, made from the logo (16, 32 and 48px), and the home screen icon (on cream)
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        // For agents: a short map of the site and its content as Markdown (server/routes)
        { rel: 'alternate', type: 'text/plain', href: '/llms.txt', title: 'LLM-friendly site index' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false, // brand: local font stack only
    colorMode: false, // no dark mode; keeps the light palette
    theme: { colors: ['primary', 'error'] }, // primary = burgundy; error kept for future form validation
    experimental: { componentDetection: true }, // only ship CSS for components we use (fast on mobile)
  },
  icon: {
    // Icons come only from locally installed sets: lucide (Select chevron/check) and
    // simple-icons (footer social logos) — never from the Iconify API
    fallbackToApi: false,
    clientBundle: {
      // Footer social logos, inlined so they render without a request (keep in sync with data/siteLinks.ts)
      icons: [
        'simple-icons:facebook',
        'simple-icons:x',
        'simple-icons:instagram',
        'simple-icons:youtube',
        'simple-icons:tiktok',
      ],
    },
  },
  image: {
    // Responsive hero crops (see TimetableSearchHero). ipx resizes from public/ on our own server;
    // on Netlify or Vercel, @nuxt/image switches to the host's image CDN automatically
    quality: 80,
    format: ['webp'],
  },
  routeRules: {
    // Every response points agents to the site's index for them
    '/**': { headers: { link: '</llms.txt>; rel="llms-txt"' } },
    // The home page as Markdown, for agents (with a search's departures when asked): search engines index the HTML
    '/index.md': { headers: { 'content-type': 'text/markdown; charset=utf-8', 'link': `<${siteUrl}/>; rel="canonical"` } },
    // Crawler and agent files, prerendered (below) and served as static files: their types, with the charset
    '/llms.txt': { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    '/llms-full.txt': { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    '/robots.txt': { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    '/sitemap.xml': { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  },
  $production: {
    routeRules: {
      '/**': { headers: securityHeaders },
    },
  },
  compatibilityDate: '2025-07-15',
  nitro: {
    prerender: {
      // Built once from the site's content and URL. /index.md isn't: with a search in its query, it lists departures
      routes: ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt'],
    },
    externals: {
      // Workaround for Nuxt 4.6.0 on Windows: Nitro leaves the renderer external, so SSR 500s with
      // "Either manifest or precomputed data must be provided". Remove once nitrojs/nitro#4732 ships.
      // https://github.com/nuxt/nuxt/issues/36467
      inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
      },
    },
  },
})

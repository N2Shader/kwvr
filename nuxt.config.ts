// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@vueuse/nuxt', '@nuxt/test-utils/module', '@nuxt/ui', '@nuxt/image'],
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: 'en-GB' },
      title: 'Keighley & Worth Valley Railway — Timetable',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Search train times for the Keighley & Worth Valley Railway.' },
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
      // Footer social logos, inlined so they render without a request (keep in sync with app.config.ts)
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
  compatibilityDate: '2025-07-15',
  nitro: {
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

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@vueuse/nuxt', '@nuxt/test-utils/module'],
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

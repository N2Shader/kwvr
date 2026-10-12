import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
      // Tests never hit the network: an iframe (e.g. StationInfo's Google map) stays empty
      // instead of loading its page once it's in the document (as vitest-axe puts it)
      happyDom: {
        settings: { disableIframePageLoading: true },
      },
    },
    include: ['test/unit/**/*.spec.ts'],
    setupFiles: ['test/setup.ts'],
  },
})

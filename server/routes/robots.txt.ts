// Prerendered at build (nuxt.config.ts), served as a static file
export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return buildRobotsTxt(useRuntimeConfig(event).public.siteUrl)
})

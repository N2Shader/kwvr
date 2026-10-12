// Prerendered at build (nuxt.config.ts), served as a static file
export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return buildSitemapXml(useRuntimeConfig(event).public.siteUrl)
})

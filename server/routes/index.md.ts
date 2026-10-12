import type { LocationQuery } from 'vue-router'

// The search page as Markdown, for agents: the home page, or a search's departures when the query holds one
// (`/index.md?from=haworth&date=2026-10-13&time=10:00`). Not prerendered, because of that query. Its canonical
// header (routeRules) points search engines back at the HTML page.
export default defineEventHandler(async (event) => {
  const { markdown, statusCode } = await getIndexMarkdownByQuery(getQuery<LocationQuery>(event), useRuntimeConfig(event).public.siteUrl)
  setResponseStatus(event, statusCode)
  setResponseHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return markdown
})

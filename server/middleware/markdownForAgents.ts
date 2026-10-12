import type { LocationQuery } from 'vue-router'

/*
 * The search page (/) as Markdown for agents: those that ask for it (Accept: text/markdown) and known AI
 * assistants and crawlers (agentDetection.ts). Everyone else, search engines included, gets the HTML.
 * A search link (/?from=…) gets its departures, like /index.md with the same query.
 */
export default defineEventHandler(async (event) => {
  if (event.method !== 'GET' || getRequestURL(event).pathname !== '/') return

  // Same address, a different body per client: shared caches must key on both
  appendResponseHeader(event, 'vary', 'Accept, User-Agent')
  if (!shouldServeMarkdown(getRequestHeader(event, 'accept'), getRequestHeader(event, 'user-agent'))) return

  const { markdown, statusCode } = await getIndexMarkdownByQuery(getQuery<LocationQuery>(event), useRuntimeConfig(event).public.siteUrl)
  setResponseStatus(event, statusCode)
  setResponseHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return markdown
})

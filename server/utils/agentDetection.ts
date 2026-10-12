// Decides whether a request for the search page (/) should get its Markdown twin instead of the HTML.
// Two signals: the client asks for Markdown (Accept), or it's a known AI assistant or crawler.
// Search engine crawlers (Googlebot, Bingbot) are left out on purpose: they index the HTML.

const AI_AGENT_USER_AGENT_PATTERN
  = /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|CCBot|cohere-ai|meta-externalagent|meta-externalfetcher|DuckAssistBot|MistralAI-User|YouBot/i

interface AcceptedMediaRange {
  mediaRange: string
  quality: number
}

const parseAcceptHeader = (acceptHeader: string): AcceptedMediaRange[] =>
  acceptHeader.split(',').map((acceptEntry) => {
    const [mediaRange = '', ...parameters] = acceptEntry.split(';').map(acceptPart => acceptPart.trim())
    const qualityParameter = parameters.find(parameter => parameter.startsWith('q='))
    const quality = qualityParameter ? Number.parseFloat(qualityParameter.slice(2)) : 1
    return { mediaRange: mediaRange.toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality }
  })

// Most specific match wins: text/html, then text/*, then */*
const getHtmlQuality = (mediaRanges: AcceptedMediaRange[]) =>
  (
    mediaRanges.find(({ mediaRange }) => mediaRange === 'text/html')
    ?? mediaRanges.find(({ mediaRange }) => mediaRange === 'text/*')
    ?? mediaRanges.find(({ mediaRange }) => mediaRange === '*/*')
  )?.quality ?? 0

// Browsers never list text/markdown, so only an explicit, at-least-as-preferred entry counts
export const prefersMarkdown = (acceptHeader: string | undefined) => {
  if (!acceptHeader) return false

  const mediaRanges = parseAcceptHeader(acceptHeader)
  const markdownQuality = mediaRanges
    .find(({ mediaRange }) => mediaRange === 'text/markdown' || mediaRange === 'text/x-markdown')
    ?.quality ?? 0

  return markdownQuality > 0 && markdownQuality >= getHtmlQuality(mediaRanges)
}

export const isAiAgentUserAgent = (userAgent: string | undefined) =>
  !!userAgent && AI_AGENT_USER_AGENT_PATTERN.test(userAgent)

export const shouldServeMarkdown = (acceptHeader: string | undefined, userAgent: string | undefined) =>
  prefersMarkdown(acceptHeader) || isAiAgentUserAgent(userAgent)

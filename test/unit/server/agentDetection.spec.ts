import { describe, expect, it } from 'vitest'
import { isAiAgentUserAgent, prefersMarkdown, shouldServeMarkdown } from '../../../server/utils/agentDetection'

const browserAccept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
const browserUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36'

describe('prefersMarkdown', () => {
  it('is true when Markdown is asked for, alone or first', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true)
    expect(prefersMarkdown('text/markdown, text/html;q=0.9')).toBe(true)
    expect(prefersMarkdown('text/x-markdown')).toBe(true)
  })

  it('is false for a browser, which never lists Markdown', () => {
    expect(prefersMarkdown(browserAccept)).toBe(false)
    expect(prefersMarkdown(undefined)).toBe(false)
  })

  it('is false when HTML is preferred over Markdown', () => {
    expect(prefersMarkdown('text/html, text/markdown;q=0.5')).toBe(false)
    expect(prefersMarkdown('text/markdown;q=0')).toBe(false)
  })
})

describe('isAiAgentUserAgent', () => {
  it('knows AI assistants and crawlers', () => {
    expect(isAiAgentUserAgent('Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)')).toBe(true)
    expect(isAiAgentUserAgent('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)')).toBe(true)
  })

  it('leaves search engines and browsers out', () => {
    expect(isAiAgentUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(false)
    expect(isAiAgentUserAgent(browserUserAgent)).toBe(false)
    expect(isAiAgentUserAgent(undefined)).toBe(false)
  })
})

describe('shouldServeMarkdown', () => {
  it('serves Markdown to an agent that asks for it or is a known AI agent, the HTML to a browser', () => {
    expect(shouldServeMarkdown('text/markdown', browserUserAgent)).toBe(true)
    expect(shouldServeMarkdown(browserAccept, 'PerplexityBot/1.0')).toBe(true)
    expect(shouldServeMarkdown(browserAccept, browserUserAgent)).toBe(false)
  })
})

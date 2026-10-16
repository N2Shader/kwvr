import { describe, expect, it } from 'vitest'
import { buildLlmsTxt, buildRobotsTxt, buildSitemapXml } from '../../../server/utils/crawlerFiles'
import { buildHomeMarkdown, buildLlmsFullTxt } from '../../../server/utils/siteMarkdown'

const siteUrl = 'https://timetable.example'

describe('buildRobotsTxt', () => {
  it('welcomes every crawler, keeps them out of the API and points to the sitemap', () => {
    expect(buildRobotsTxt(siteUrl)).toBe('User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://timetable.example/sitemap.xml\n')
  })
})

describe('buildSitemapXml', () => {
  it('lists the one page', () => {
    expect(buildSitemapXml(siteUrl)).toContain('<url><loc>https://timetable.example/</loc></url>')
  })
})

describe('buildLlmsTxt', () => {
  const llmsTxt = buildLlmsTxt(siteUrl)

  it('starts with the site\'s name and summary (llmstxt.org)', () => {
    expect(llmsTxt.startsWith('# Keighley & Worth Valley Railway: train times\n\n> Train times for the Keighley & Worth Valley Railway')).toBe(true)
  })

  it('links to the Markdown pages, with the search link\'s pattern', () => {
    expect(llmsTxt).toContain(`- [Home page](${siteUrl}/index.md)`)
    expect(llmsTxt).toContain(`- [Departures](${siteUrl}/index.md?from=<station-id>&date=<YYYY-MM-DD>&time=<HH:MM>)`)
    expect(llmsTxt).toContain(`- [Full content](${siteUrl}/llms-full.txt)`)
  })

  it('lists the six stations with their ids', () => {
    expect(llmsTxt).toContain(`- [Ingrow West](${siteUrl}/index.md#ingrow-west): id \`ingrow-west\``)
    expect(llmsTxt.match(/: id `/g)).toHaveLength(6)
  })
})

describe('buildHomeMarkdown', () => {
  const homeMarkdown = buildHomeMarkdown(siteUrl)

  it('explains how to link to a search, page and Markdown', () => {
    expect(homeMarkdown).toContain(`\`${siteUrl}/?from=<station-id>&date=<YYYY-MM-DD>&time=<HH:MM>\``)
    expect(homeMarkdown).toContain(`\`${siteUrl}/index.md?from=<station-id>&date=<YYYY-MM-DD>&time=<HH:MM>\``)
    expect(homeMarkdown).toContain('| Ingrow West | `ingrow-west` |')
  })

  it('describes each station, with its map and its page on kwvr.co.uk', () => {
    expect(homeMarkdown).toContain('### Haworth')
    expect(homeMarkdown).toContain('Brontë Parsonage Museum')
    expect(homeMarkdown).toContain('- Map: https://www.openstreetmap.org/?mlat=53.8312&mlon=-1.9488#map=16/53.8312/-1.9488')
    expect(homeMarkdown).toContain('- More on kwvr.co.uk: https://kwvr.co.uk/visiting-the-kwvr/stations/haworth-station/')
  })

  it('leaves out "Things to do" for a station that lists none (Damems)', () => {
    const damemsSection = homeMarkdown.split('### Damems')[1]?.split('###')[0] ?? ''

    expect(damemsSection).not.toContain('Things to do')
  })

  it('ends with the visiting links and the railway\'s contact details', () => {
    expect(homeMarkdown).toContain('- [Fares](https://kwvr.co.uk/visiting-the-kwvr/fares/)')
    expect(homeMarkdown).toContain('- Telephone: 01535 645214')
    expect(homeMarkdown).toContain('- Email: admin@kwvr.co.uk')
  })

  it('is the full content too, as the site is one page', () => {
    expect(buildLlmsFullTxt(siteUrl)).toBe(homeMarkdown)
  })
})

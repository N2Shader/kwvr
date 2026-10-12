import { railwayHomeHref, siteName, siteSummary } from '~/data/siteContent'
import { stationDetailsList } from '~/data/stationDetails'
import { searchLinkPattern } from './siteMarkdown'

// The crawler and agent files, prerendered at build (nuxt.config.ts) with the site's absolute URL.

// No per-bot rules: search engines and AI crawlers are all welcome. The search endpoint isn't a page
export const buildRobotsTxt = (siteUrl: string) =>
  ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n')

// One page: search links (/?from=…) are that page (their canonical link says so). No <lastmod>: a build
// date would claim changes that didn't happen
export const buildSitemapXml = (siteUrl: string) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${siteUrl}/</loc></url>`,
    '</urlset>',
    '',
  ].join('\n')

// llms.txt (https://llmstxt.org): a short map of the site for language models
export const buildLlmsTxt = (siteUrl: string) =>
  [
    `# ${siteName}: train times`,
    '',
    `> ${siteSummary}`,
    '',
    'The site is one page, a timetable search. Every search has its own address, and the page and any search are available as Markdown.',
    '',
    '## Content',
    '',
    `- [Home page](${siteUrl}/index.md): how to search and link to a search, the station ids, the six stations, visiting and contact details`,
    `- [Departures](${siteUrl}/index.md${searchLinkPattern}): the trains leaving a station at or after a time, both ways, with their stops and symbols (put in a station id, a date and a time)`,
    `- [Full content](${siteUrl}/llms-full.txt): the home page in one file`,
    '',
    '## Stations',
    '',
    ...stationDetailsList.map(stationDetails =>
      `- [${stationDetails.station.name}](${siteUrl}/index.md#${stationDetails.station.id}): id \`${stationDetails.station.id}\``),
    '',
    '## Optional',
    '',
    `- [Search page](${siteUrl}/): the HTML version`,
    `- [${siteName}](${railwayHomeHref}): the railway’s main site (fares, events, visiting)`,
    '',
  ].join('\n')

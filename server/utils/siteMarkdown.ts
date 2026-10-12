import { placeholderStations } from '~/data/placeholderTimetable'
import { railwayHomeHref, siteName, siteSummary } from '~/data/siteContent'
import { siteLinks } from '~/data/siteLinks'
import { stationDetailsList } from '~/data/stationDetails'
import { stationHighlights } from '~/data/stationHighlights'
import { getMapLinkHrefByLocation } from '~/utils/stationMapLinks'

// The search page as Markdown, for agents: /index.md, /llms-full.txt, and / for agents that ask for Markdown
// (server/middleware/markdownForAgents.ts). Built from the same content as the page, so the two can't drift.

/** How to link to a search, with placeholders: `/?from=<station-id>&date=<YYYY-MM-DD>&time=<HH:MM>` */
export const searchLinkPattern = '?from=<station-id>&date=<YYYY-MM-DD>&time=<HH:MM>'

const buildStationIdsMarkdown = () => [
  '| Station | id |',
  '| --- | --- |',
  ...placeholderStations.map(station => `| ${station.name} | \`${station.id}\` |`),
].join('\n')

// Each station's block under the results (StationInfo), plus its page on kwvr.co.uk (its card's link)
const buildStationsMarkdown = () => stationDetailsList.map((stationDetails) => {
  const stationHighlight = stationHighlights.find(highlight => highlight.station.id === stationDetails.station.id)
  return [
    `### ${stationDetails.station.name}`,
    '',
    stationDetails.description,
    '',
    ...(stationDetails.thingsToDo.length > 0 ? [`Things to do: ${stationDetails.thingsToDo.join(', ')}.`, ''] : []),
    `- Map: ${getMapLinkHrefByLocation(stationDetails.mapLocation)}`,
    ...(stationHighlight ? [`- More on kwvr.co.uk: ${stationHighlight.pageHref}`] : []),
  ].join('\n')
}).join('\n\n')

const buildVisitingMarkdown = () => [
  ...siteLinks.primaryNav.map(navLink => `- [${navLink.label}](${navLink.href})`),
  `- [${siteLinks.donateLink.label}](${siteLinks.donateLink.href})`,
].join('\n')

const buildContactMarkdown = () => {
  const { contact, legalLinks, organisation, socialLinks } = siteLinks
  return [
    `- Telephone: ${contact.telephone.label}`,
    `- Email: ${contact.email.label}`,
    `- ${organisation.name} (${organisation.registration})`,
    `- ${legalLinks.map(legalLink => `[${legalLink.label}](${legalLink.href})`).join(', ')}`,
    `- Social media: ${socialLinks.map(socialLink => `[${socialLink.label}](${socialLink.href})`).join(', ')}`,
  ].join('\n')
}

/** The search page as Markdown: how to search (and link to a search), the stations, visiting and contact */
export const buildHomeMarkdown = (siteUrl: string) => [
  `# ${siteName}: train times`,
  '',
  `> ${siteSummary}`,
  '',
  `This is the railway’s timetable search: ${siteUrl}/. The railway’s main site is ${railwayHomeHref}.`,
  '',
  '## Find train times',
  '',
  'Choose a station, a date and a time: the search lists the trains leaving that station at or after that time, both ways along the line, each with its stops. Times are UK local time, on the 24-hour clock. The railway doesn’t run every day.',
  '',
  'Every search has its own address, so it can be linked to directly:',
  '',
  `\`${siteUrl}/${searchLinkPattern}\``,
  '',
  'The same search as Markdown, with its departures and their stops:',
  '',
  `\`${siteUrl}/index.md${searchLinkPattern}\``,
  '',
  `For example, the trains from Haworth after 10:00 on a given day: \`${siteUrl}/index.md?from=haworth&date=<YYYY-MM-DD>&time=10:00\``,
  '',
  'Station ids, in line order from Keighley to Oxenhope:',
  '',
  buildStationIdsMarkdown(),
  '',
  '## Stations',
  '',
  buildStationsMarkdown(),
  '',
  '## Visiting',
  '',
  buildVisitingMarkdown(),
  '',
  '## Contact',
  '',
  buildContactMarkdown(),
  '',
].join('\n')

/** llms-full.txt: the site is one page, so its full content is the home page */
export const buildLlmsFullTxt = (siteUrl: string) => buildHomeMarkdown(siteUrl)

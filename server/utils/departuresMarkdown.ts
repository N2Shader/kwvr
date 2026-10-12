import type { TimetableSearchCriteria, TrainService, TrainServiceNote } from '~/types/timetable'
import { siteName } from '~/data/siteContent'
import { getSearchQueryStringByCriteria } from '~/utils/searchRouteQuery'
import { formatClockTime, formatJourneySummary, formatLongDate, formatStopCount } from '~/utils/timetableFormatting'

// A search's departures as Markdown, for agents: /index.md?from=…, and /?from=… for agents that ask for
// Markdown. The same rows as the page's results (getTrainServicesByCriteria), as text.

// "Trains from Haworth after 10:00 on 13 October 2026"
const formatDeparturesHeading = ({ origin, departingAfter }: TimetableSearchCriteria) =>
  `Trains from ${origin.name} after ${formatClockTime(departingAfter)} on ${formatLongDate(departingAfter)}`

// The search page's address for this search, e.g. `https://…/?from=haworth&date=2026-10-13&time=10:00`
const getSearchPageHref = (siteUrl: string, criteria: TimetableSearchCriteria) =>
  `${siteUrl}/${getSearchQueryStringByCriteria(criteria)}`

// A row's notes, as the page's Info cell shows them: its service alert (in text), then its symbols' labels
const formatTrainServiceNotes = (trainService: TrainService) =>
  [...(trainService.hasServiceAlert ? ['Service alert'] : []), ...trainService.notes.map(note => note.label)].join(', ') || '–'

const buildDeparturesTableMarkdown = (trainServices: TrainService[]) => [
  '| Departs | From | To | Arrives | Stops on the way | Notes |',
  '| --- | --- | --- | --- | --- | --- |',
  ...trainServices.map(trainService => [
    formatClockTime(trainService.departsAt),
    trainService.origin.name,
    trainService.destination.name,
    formatClockTime(trainService.arrivesAt),
    formatStopCount(trainService.stopCount),
    formatTrainServiceNotes(trainService),
  ].join(' | ')).map(tableCells => `| ${tableCells} |`),
].join('\n')

// "(last train, service alert)" after a journey's heading, or nothing
const formatJourneyMarkers = ({ isLastTrain, hasServiceAlert }: TrainService) => {
  const journeyMarkers = [isLastTrain ? 'last train' : '', hasServiceAlert ? 'service alert' : ''].filter(Boolean)
  return journeyMarkers.length > 0 ? ` (${journeyMarkers.join(', ')})` : ''
}

// Each train's stops from the searched station on, like the journey's dialog on the page
const buildStopsMarkdown = (trainServices: TrainService[]) => trainServices.map(trainService => [
  `### ${formatJourneySummary(trainService)}${formatJourneyMarkers(trainService)}`,
  '',
  ...trainService.calls.map((call) => {
    const callDetails = [call.timeType === 'departure' ? 'departs' : 'arrives', call.requestStopDescription ? 'request stop' : '']
      .filter(Boolean)
      .join(', ')
    return `- ${formatClockTime(call.time)} ${call.station.name} (${callDetails})`
  }),
].join('\n')).join('\n\n')

// What the symbols and the request stops in these departures mean, each once, like the page's Key
const buildKeyMarkdown = (trainServices: TrainService[]) => {
  const keyNotes = [...new Map<string, TrainServiceNote>(trainServices
    .flatMap(trainService => trainService.notes)
    .map(note => [note.code, note])).values()]
  const requestStopDescription = trainServices
    .flatMap(trainService => trainService.calls)
    .find(call => call.requestStopDescription)?.requestStopDescription

  return [
    ...keyNotes.map(note => `- **${note.label}**: ${note.description}`),
    ...(requestStopDescription ? [`- **Request stop**: ${requestStopDescription}`] : []),
  ].join('\n')
}

const buildFooterMarkdown = (siteUrl: string) =>
  `How to search, the stations and the railway’s contact details: ${siteUrl}/index.md`

/** A search's departures: a table of the trains, then each one's stops, then what the symbols mean */
export const buildDeparturesMarkdown = (siteUrl: string, criteria: TimetableSearchCriteria, trainServices: TrainService[]) => {
  const introduction = [
    `# ${formatDeparturesHeading(criteria)}`,
    '',
    `${siteName}. The same search on the web: ${getSearchPageHref(siteUrl, criteria)}`,
    '',
  ]

  if (trainServices.length === 0) {
    return [
      ...introduction,
      `No trains leave ${criteria.origin.name} at or after ${formatClockTime(criteria.departingAfter)} on ${formatLongDate(criteria.departingAfter)}. The railway doesn’t run every day, so try another date or an earlier time.`,
      '',
      buildFooterMarkdown(siteUrl),
      '',
    ].join('\n')
  }

  return [
    ...introduction,
    '## Departures',
    '',
    `${trainServices.length === 1 ? '1 train' : `${trainServices.length} trains`}, both ways along the line, earliest first. Times are UK local time.`,
    '',
    buildDeparturesTableMarkdown(trainServices),
    '',
    '## Stops',
    '',
    buildStopsMarkdown(trainServices),
    '',
    '## Key',
    '',
    buildKeyMarkdown(trainServices),
    '',
    buildFooterMarkdown(siteUrl),
    '',
  ].join('\n')
}

/** The search couldn't run (the timetable API failed): the page's error state, as text */
export const buildDeparturesErrorMarkdown = (siteUrl: string, criteria: TimetableSearchCriteria) => [
  `# ${formatDeparturesHeading(criteria)}`,
  '',
  'Sorry, we couldn’t load the timetable. Please try again in a moment.',
  '',
  buildFooterMarkdown(siteUrl),
  '',
].join('\n')

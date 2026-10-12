import type { Station, TimetableSearchCriteria, TimetableSearchDefaults } from '~/types/timetable'

// Temporary static data mirroring the Figma design. Replace with an API composable.

const keighley: Station = { id: 'keighley', name: 'Keighley' }
const ingrowWest: Station = { id: 'ingrow-west', name: 'Ingrow West' }
const damems: Station = { id: 'damems', name: 'Damems' }
const oakworth: Station = { id: 'oakworth', name: 'Oakworth' }
const haworth: Station = { id: 'haworth', name: 'Haworth' }
const oxenhope: Station = { id: 'oxenhope', name: 'Oxenhope' }

export const placeholderStations: Station[] = [keighley, ingrowWest, damems, oakworth, haworth, oxenhope]

export const placeholderSearchCriteria: TimetableSearchCriteria = {
  origin: haworth,
  departingAfter: '2026-04-24T12:00',
}

// No origin, so the form starts on "Select a station" (the date and time come from the user's clock)
export const placeholderSearchDefaults: TimetableSearchDefaults = {}

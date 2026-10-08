import type { Station, TimetableSearchCriteria, TrainService } from '~/types/timetable'

export const keighleyFixture: Station = { id: 'keighley', name: 'Keighley' }
export const haworthFixture: Station = { id: 'haworth', name: 'Haworth' }
export const oxenhopeFixture: Station = { id: 'oxenhope', name: 'Oxenhope' }

export const stationsFixture: Station[] = [keighleyFixture, haworthFixture, oxenhopeFixture]

export const searchCriteriaFixture: TimetableSearchCriteria = {
  origin: haworthFixture,
  departingAfter: '2026-04-24T12:00',
}

export const servicesFixture: TrainService[] = [
  { id: 'fixture-1220', origin: haworthFixture, destination: keighleyFixture, departsAt: '2026-04-24T12:20', arrivesAt: '2026-04-24T13:00', stopCount: 4, hasServiceAlert: false },
  { id: 'fixture-1320', origin: haworthFixture, destination: oxenhopeFixture, departsAt: '2026-04-24T13:20', arrivesAt: '2026-04-24T14:00', stopCount: 0, hasServiceAlert: false },
  { id: 'fixture-1620', origin: haworthFixture, destination: keighleyFixture, departsAt: '2026-04-24T16:20', arrivesAt: '2026-04-24T17:00', stopCount: 1, hasServiceAlert: true },
]

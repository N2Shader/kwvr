import type { Station, StationAttraction, StationDetails, TimetableSearchCriteria, TrainService } from '~/types/timetable'

// Temporary static data mirroring the Figma design. Replace with an API composable.

const keighley: Station = { id: 'keighley', name: 'Keighley' }
const ingrowWest: Station = { id: 'ingrow-west', name: 'Ingrow West' }
const damems: Station = { id: 'damems', name: 'Damems' }
const oakworth: Station = { id: 'oakworth', name: 'Oakworth' }
const haworth: Station = { id: 'haworth', name: 'Haworth' }
const oxenhope: Station = { id: 'oxenhope', name: 'Oxenhope' }

const placeholderLoremShort = 'Lorem ipsum dolor sit amet consectetur. Placerat nulla vitae duis urna maecenas vitae sit massa.'

export const placeholderStations: Station[] = [keighley, ingrowWest, damems, oakworth, haworth, oxenhope]

export const placeholderSearchCriteria: TimetableSearchCriteria = {
  origin: haworth,
  departingAfter: '2026-04-24T12:00',
}

export const placeholderServices: TrainService[] = [
  { id: 'service-1220', origin: haworth, destination: keighley, departsAt: '2026-04-24T12:20', arrivesAt: '2026-04-24T13:00', stopCount: 4, hasServiceAlert: false },
  { id: 'service-1320', origin: haworth, destination: oxenhope, departsAt: '2026-04-24T13:20', arrivesAt: '2026-04-24T14:00', stopCount: 0, hasServiceAlert: false },
  { id: 'service-1420', origin: haworth, destination: keighley, departsAt: '2026-04-24T14:20', arrivesAt: '2026-04-24T15:00', stopCount: 4, hasServiceAlert: false },
  { id: 'service-1520', origin: haworth, destination: oxenhope, departsAt: '2026-04-24T15:20', arrivesAt: '2026-04-24T16:00', stopCount: 0, hasServiceAlert: false },
  { id: 'service-1620', origin: haworth, destination: keighley, departsAt: '2026-04-24T16:20', arrivesAt: '2026-04-24T17:00', stopCount: 4, hasServiceAlert: true },
]

export const placeholderStationDetails: StationDetails = {
  station: haworth,
  description: 'Lorem ipsum dolor sit amet consectetur. Placerat nulla vitae duis urna maecenas vitae sit massa. Et bibendum pulvinar habitant sagittis volutpat tristique dictumst. In pretium massa diam est. In consectetur dolor a proin arcu lacus. Leo mus felis amet eu justo. In at elementum proin eget. Vitae consequat at dui blandit amet suspendisse consequat felis aliquam.',
}

export const placeholderAttractions: StationAttraction[] = [
  { id: 'train-museum', title: 'Train museum', description: placeholderLoremShort, imageSrc: '/images/station-card.jpg' },
  { id: 'damems-station', title: 'Damems station', description: placeholderLoremShort, imageSrc: '/images/station-card.jpg' },
  { id: 'keighley-station', title: 'Keighley station', description: placeholderLoremShort, imageSrc: '/images/station-card.jpg' },
]

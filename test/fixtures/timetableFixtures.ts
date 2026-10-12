import type { Station, TimetableSearchCriteria, TrainService, TrainServiceCall, TrainServiceNote } from '~/types/timetable'
import type { TimetableApiResponse } from '~/types/timetableApi'

export const keighleyFixture: Station = { id: 'keighley', name: 'Keighley' }
export const haworthFixture: Station = { id: 'haworth', name: 'Haworth' }
export const oxenhopeFixture: Station = { id: 'oxenhope', name: 'Oxenhope' }
export const oakworthFixture: Station = { id: 'oakworth', name: 'Oakworth' }
export const damemsFixture: Station = { id: 'damems', name: 'Damems' }
export const ingrowWestFixture: Station = { id: 'ingrow-west', name: 'Ingrow West' }

export const stationsFixture: Station[] = [keighleyFixture, haworthFixture, oxenhopeFixture]

export const searchCriteriaFixture: TimetableSearchCriteria = {
  origin: haworthFixture,
  departingAfter: '2026-04-24T12:00',
}

// The key's symbols as they reach a result row
export const dieselNoteFixture: TrainServiceNote = { code: 'diesel', label: 'Diesel train', description: 'Diesel Train', iconSrc: '/images/timetable-key/diesel.webp' }
export const steamNoteFixture: TrainServiceNote = { code: 'steam', label: 'Steam train', description: 'Steam Train', iconSrc: '/images/timetable-key/steam.webp' }
export const barNoteFixture: TrainServiceNote = { code: 'bar', label: 'Real Ale Bar Car', description: 'This train includes a Real Ale Bar Car.', iconSrc: '/images/timetable-key/bar.webp' }
export const railStoryNoteFixture: TrainServiceNote = { code: 'rail-story', label: 'Rail Story museums at Ingrow', description: 'Alight at Ingrow for “Rail Story” museums & exhibitions.', iconSrc: '/images/timetable-key/rail-story.webp' }
export const nationalRailNoteFixture: TrainServiceNote = { code: 'national-rail-connection', label: 'National Rail connections', description: 'Connections with National Rail services.', iconSrc: '/images/timetable-key/national-rail.webp' }
export const lastTrainNoteFixture: TrainServiceNote = { code: 'last-train', label: 'Last train', description: 'Last train of the day from this station', iconSrc: '/images/timetable-key/last-train.webp' }

// The key's `x` wording, as a request stop reaches a journey's stops
export const requestStopDescriptionFixture = 'Request Stop'

// The first result's journey: Haworth to Keighley, with a request stop and two station symbols
export const haworthToKeighleyCallsFixture: TrainServiceCall[] = [
  { station: haworthFixture, time: '2026-04-24T12:20', timeType: 'departure', notes: [] },
  { station: oakworthFixture, time: '2026-04-24T12:27', timeType: 'departure', notes: [] },
  { station: damemsFixture, time: '2026-04-24T12:35', timeType: 'departure', requestStopDescription: requestStopDescriptionFixture, notes: [] },
  { station: ingrowWestFixture, time: '2026-04-24T12:42', timeType: 'departure', notes: [railStoryNoteFixture] },
  { station: keighleyFixture, time: '2026-04-24T13:00', timeType: 'arrival', notes: [nationalRailNoteFixture] },
]

const haworthToOxenhopeCallsFixture: TrainServiceCall[] = [
  { station: haworthFixture, time: '2026-04-24T13:20', timeType: 'departure', notes: [] },
  { station: oxenhopeFixture, time: '2026-04-24T14:00', timeType: 'arrival', notes: [] },
]

const haworthToOxenhopeLastCallsFixture: TrainServiceCall[] = [
  { station: haworthFixture, time: '2026-04-24T17:20', timeType: 'departure', notes: [] },
  { station: oxenhopeFixture, time: '2026-04-24T17:30', timeType: 'arrival', notes: [] },
]

const haworthToKeighleyLateCallsFixture: TrainServiceCall[] = [
  { station: haworthFixture, time: '2026-04-24T16:20', timeType: 'departure', notes: [] },
  { station: ingrowWestFixture, time: '2026-04-24T16:42', timeType: 'departure', notes: [] },
  { station: keighleyFixture, time: '2026-04-24T17:00', timeType: 'arrival', notes: [] },
]

export const servicesFixture: TrainService[] = [
  { id: 'fixture-1220', origin: haworthFixture, destination: keighleyFixture, departsAt: '2026-04-24T12:20', arrivesAt: '2026-04-24T13:00', stopCount: 3, hasServiceAlert: false, isLastTrain: false, notes: [dieselNoteFixture, railStoryNoteFixture, nationalRailNoteFixture], calls: haworthToKeighleyCallsFixture },
  { id: 'fixture-1320', origin: haworthFixture, destination: oxenhopeFixture, departsAt: '2026-04-24T13:20', arrivesAt: '2026-04-24T14:00', stopCount: 0, hasServiceAlert: false, isLastTrain: false, notes: [], calls: haworthToOxenhopeCallsFixture },
  { id: 'fixture-1620', origin: haworthFixture, destination: keighleyFixture, departsAt: '2026-04-24T16:20', arrivesAt: '2026-04-24T17:00', stopCount: 1, hasServiceAlert: true, isLastTrain: false, notes: [steamNoteFixture, barNoteFixture, dieselNoteFixture], calls: haworthToKeighleyLateCallsFixture },
  // The last train (the last row, whichever way it goes): its row is tinted and its symbol comes first
  { id: 'fixture-1720', origin: haworthFixture, destination: oxenhopeFixture, departsAt: '2026-04-24T17:20', arrivesAt: '2026-04-24T17:30', stopCount: 0, hasServiceAlert: false, isLastTrain: true, notes: [lastTrainNoteFixture, steamNoteFixture], calls: haworthToOxenhopeLastCallsFixture },
]

// The key's symbols in the response's shape, built from the note fixtures so the two can't drift apart
const toKeyEntry = ({ code, label, description, iconSrc }: TrainServiceNote) => ({ code, label, description, icon: iconSrc })

/**
 * A cut-down endpoint answer (all on the same day): two trains towards Keighley, and two from Keighley,
 * the later one ending at Haworth. Ingrow West and Keighley carry station symbols.
 */
export const timetableResponseFixture: TimetableApiResponse = {
  timeTable: 'orange',
  stations: [
    { ...oxenhopeFixture, notes: [] },
    { ...haworthFixture, notes: [] },
    { ...damemsFixture, notes: [] },
    { ...ingrowWestFixture, notes: ['rail-story'] },
    { ...keighleyFixture, notes: ['national-rail-connection'] },
  ],
  journeys: [
    {
      from: 'oxenhope',
      to: 'keighley',
      services: [
        {
          id: 'fixture-oxenhope-1100',
          notes: ['diesel'],
          calls: [
            { stationId: 'oxenhope', time: '11:00', timeType: 'departure' },
            { stationId: 'haworth', time: '11:05', timeType: 'departure' },
            { stationId: 'damems', time: '11:10', timeType: 'departure', requestStop: true },
            { stationId: 'ingrow-west', time: '11:13', timeType: 'departure' },
            { stationId: 'keighley', time: '11:20', timeType: 'arrival' },
          ],
        },
        {
          id: 'fixture-oxenhope-1330',
          notes: ['steam', 'bar'],
          calls: [
            { stationId: 'oxenhope', time: '13:30', timeType: 'departure' },
            { stationId: 'haworth', time: '13:35', timeType: 'departure' },
            { stationId: 'damems', time: '13:40', timeType: 'departure', requestStop: true },
            { stationId: 'ingrow-west', time: '13:43', timeType: 'departure' },
            { stationId: 'keighley', time: '13:50', timeType: 'arrival' },
          ],
        },
      ],
    },
    {
      from: 'keighley',
      to: 'oxenhope',
      services: [
        {
          id: 'fixture-keighley-1200',
          notes: ['diesel'],
          calls: [
            { stationId: 'keighley', time: '12:00', timeType: 'departure' },
            { stationId: 'ingrow-west', time: '12:05', timeType: 'departure' },
            { stationId: 'damems', time: '12:08', timeType: 'departure', requestStop: true },
            { stationId: 'haworth', time: '12:15', timeType: 'departure' },
            { stationId: 'oxenhope', time: '12:20', timeType: 'arrival' },
          ],
        },
        {
          id: 'fixture-keighley-1600',
          notes: ['diesel'],
          calls: [
            { stationId: 'keighley', time: '16:00', timeType: 'departure' },
            { stationId: 'ingrow-west', time: '16:05', timeType: 'departure' },
            { stationId: 'damems', time: '16:08', timeType: 'departure', requestStop: true },
            { stationId: 'haworth', time: '16:15', timeType: 'arrival' },
          ],
        },
      ],
    },
  ],
  key: [
    { code: 'a', description: 'Arrival Time' },
    { code: 'd', description: 'Departure Time' },
    { code: 'x', description: requestStopDescriptionFixture },
    toKeyEntry(nationalRailNoteFixture),
    toKeyEntry(railStoryNoteFixture),
    toKeyEntry(barNoteFixture),
    toKeyEntry(steamNoteFixture),
    toKeyEntry(dieselNoteFixture),
    toKeyEntry(lastTrainNoteFixture),
  ],
}

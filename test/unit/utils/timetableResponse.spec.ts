import { describe, expect, it } from 'vitest'
import { getTrainServicesByCriteria } from '~/utils/timetableResponse'
import {
  barNoteFixture,
  damemsFixture,
  dieselNoteFixture,
  haworthFixture,
  ingrowWestFixture,
  keighleyFixture,
  nationalRailNoteFixture,
  oxenhopeFixture,
  railStoryNoteFixture,
  requestStopDescriptionFixture,
  steamNoteFixture,
  timetableResponseFixture,
} from '../../fixtures/timetableFixtures'

// The 13:30 from Oxenhope, from Haworth on, dated on the searched day
const haworthToKeighleyCalls = [
  { station: haworthFixture, time: '2026-10-09T13:35', timeType: 'departure', notes: [] },
  { station: damemsFixture, time: '2026-10-09T13:40', timeType: 'departure', requestStopDescription: requestStopDescriptionFixture, notes: [] },
  { station: ingrowWestFixture, time: '2026-10-09T13:43', timeType: 'departure', notes: [railStoryNoteFixture] },
  { station: keighleyFixture, time: '2026-10-09T13:50', timeType: 'arrival', notes: [nationalRailNoteFixture] },
]

const haworthToOxenhopeCalls = [
  { station: haworthFixture, time: '2026-10-09T12:15', timeType: 'departure', notes: [] },
  { station: oxenhopeFixture, time: '2026-10-09T12:20', timeType: 'arrival', notes: [] },
]

describe('getTrainServicesByCriteria', () => {
  it('returns the trains leaving the station after the time, both ways, earliest first, dated on the searched day', () => {
    const trainServices = getTrainServicesByCriteria(timetableResponseFixture, { origin: haworthFixture, departingAfter: '2026-10-09T12:00' })

    expect(trainServices).toEqual([
      { id: 'fixture-keighley-1200', origin: haworthFixture, destination: oxenhopeFixture, departsAt: '2026-10-09T12:15', arrivesAt: '2026-10-09T12:20', stopCount: 0, hasServiceAlert: false, notes: [dieselNoteFixture], calls: haworthToOxenhopeCalls },
      { id: 'fixture-oxenhope-1330', origin: haworthFixture, destination: keighleyFixture, departsAt: '2026-10-09T13:35', arrivesAt: '2026-10-09T13:50', stopCount: 2, hasServiceAlert: false, notes: [steamNoteFixture, barNoteFixture, railStoryNoteFixture, nationalRailNoteFixture], calls: haworthToKeighleyCalls },
    ])
  })

  it('keeps a train leaving at exactly the searched time', () => {
    const trainServices = getTrainServicesByCriteria(timetableResponseFixture, { origin: haworthFixture, departingAfter: '2026-10-09T13:35' })

    expect(trainServices.map(trainService => trainService.id)).toEqual(['fixture-oxenhope-1330'])
  })

  it('leaves out a train that only arrives at the station (it ends there)', () => {
    expect(getTrainServicesByCriteria(timetableResponseFixture, { origin: haworthFixture, departingAfter: '2026-10-09T14:00' })).toEqual([])
  })

  it('counts the stops between the searched station and the last one', () => {
    const trainServices = getTrainServicesByCriteria(timetableResponseFixture, { origin: oxenhopeFixture, departingAfter: '2026-10-09T10:00' })

    expect(trainServices.map(trainService => trainService.stopCount)).toEqual([3, 3])
  })

  it('ends a row where the train ends, even part-way down the line', () => {
    const trainServices = getTrainServicesByCriteria(timetableResponseFixture, { origin: keighleyFixture, departingAfter: '2026-10-09T15:00' })

    expect(trainServices).toHaveLength(1)
    expect(trainServices[0]?.destination).toEqual(haworthFixture)
    expect(trainServices[0]?.arrivesAt).toBe('2026-10-09T16:15')
  })

  it('lists the train symbols first, then those of the stations it calls at from the origin on', () => {
    const [trainService] = getTrainServicesByCriteria(timetableResponseFixture, { origin: keighleyFixture, departingAfter: '2026-10-09T10:00' })

    expect(trainService?.notes).toEqual([dieselNoteFixture, nationalRailNoteFixture, railStoryNoteFixture])
  })

  it('leaves out the symbols of stations before the origin', () => {
    const [trainService] = getTrainServicesByCriteria(timetableResponseFixture, { origin: haworthFixture, departingAfter: '2026-10-09T12:00' })

    expect(trainService?.notes).toEqual([dieselNoteFixture])
  })

  it('lists the journey’s stops from the searched station to the last, dated on the searched day', () => {
    const trainServices = getTrainServicesByCriteria(timetableResponseFixture, { origin: haworthFixture, departingAfter: '2026-10-09T13:00' })

    expect(trainServices[0]?.calls).toEqual(haworthToKeighleyCalls)
  })

  it('gives a request stop the key’s wording, and no other stop any', () => {
    const [trainService] = getTrainServicesByCriteria(timetableResponseFixture, { origin: oxenhopeFixture, departingAfter: '2026-10-09T10:00' })
    const requestStopDescriptions = trainService?.calls.map(call => call.requestStopDescription)

    expect(requestStopDescriptions).toEqual([undefined, undefined, requestStopDescriptionFixture, undefined, undefined])
  })
})

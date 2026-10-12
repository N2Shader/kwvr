import { describe, expect, it } from 'vitest'
import { CalendarDate, Time } from '@internationalized/date'
import { getSearchCriteriaByFormValues, getSearchFormValuesByCriteria, isDepartingAfterOnDate, isSameSearchCriteria } from '~/utils/searchCriteria'
import { haworthFixture, keighleyFixture, stationsFixture } from '../../fixtures/timetableFixtures'

const departingDate = new CalendarDate(2026, 10, 9)

describe('getSearchCriteriaByFormValues', () => {
  it('builds the criteria from the station and a zero-padded local date-time', () => {
    const searchCriteria = getSearchCriteriaByFormValues({ originId: 'haworth', departingDate, departingTime: new Time(9, 5) }, stationsFixture)

    expect(searchCriteria).toEqual({ origin: haworthFixture, departingAfter: '2026-10-09T09:05' })
  })

  it('drops the seconds from the time', () => {
    const searchCriteria = getSearchCriteriaByFormValues({ originId: 'haworth', departingDate, departingTime: new Time(14, 30, 45) }, stationsFixture)

    expect(searchCriteria?.departingAfter).toBe('2026-10-09T14:30')
  })

  it('gives nothing for a station that isn\'t in the list', () => {
    expect(getSearchCriteriaByFormValues({ originId: 'leeds', departingDate, departingTime: new Time(9, 0) }, stationsFixture)).toBeUndefined()
  })

  it('gives nothing while the station, date or time is missing', () => {
    expect(getSearchCriteriaByFormValues({ departingDate, departingTime: new Time(9, 0) }, stationsFixture)).toBeUndefined()
    expect(getSearchCriteriaByFormValues({ originId: 'haworth', departingTime: new Time(9, 0) }, stationsFixture)).toBeUndefined()
    expect(getSearchCriteriaByFormValues({ originId: 'haworth', departingDate }, stationsFixture)).toBeUndefined()
  })
})

describe('getSearchFormValuesByCriteria', () => {
  it('gives the form the station, date and time of a search', () => {
    const searchFormValues = getSearchFormValuesByCriteria({ origin: haworthFixture, departingAfter: '2026-10-09T09:05' })

    expect(searchFormValues.originId).toBe('haworth')
    expect(searchFormValues.departingDate?.compare(departingDate)).toBe(0)
    expect(searchFormValues.departingTime?.compare(new Time(9, 5))).toBe(0)
  })

  it('round-trips with getSearchCriteriaByFormValues', () => {
    const searchCriteria = { origin: haworthFixture, departingAfter: '2026-10-09T14:30' }

    expect(getSearchCriteriaByFormValues(getSearchFormValuesByCriteria(searchCriteria), stationsFixture)).toEqual(searchCriteria)
  })
})

describe('isSameSearchCriteria', () => {
  const haworthAtNine = { origin: haworthFixture, departingAfter: '2026-10-09T09:00' }

  it('matches equal values held in different objects', () => {
    expect(isSameSearchCriteria(haworthAtNine, { origin: { ...haworthFixture }, departingAfter: '2026-10-09T09:00' })).toBe(true)
  })

  it('tells apart a different station', () => {
    expect(isSameSearchCriteria(haworthAtNine, { origin: keighleyFixture, departingAfter: '2026-10-09T09:00' })).toBe(false)
  })

  it('tells apart a different date or time', () => {
    expect(isSameSearchCriteria(haworthAtNine, { origin: haworthFixture, departingAfter: '2026-10-09T09:30' })).toBe(false)
    expect(isSameSearchCriteria(haworthAtNine, { origin: haworthFixture, departingAfter: '2026-10-10T09:00' })).toBe(false)
  })
})

describe('isDepartingAfterOnDate', () => {
  it('is true on the search day, whatever the time', () => {
    expect(isDepartingAfterOnDate('2026-10-09T09:00', departingDate)).toBe(true)
    expect(isDepartingAfterOnDate('2026-10-09T23:59', departingDate)).toBe(true)
  })

  it('is false on another day', () => {
    expect(isDepartingAfterOnDate('2026-10-10T09:00', departingDate)).toBe(false)
    expect(isDepartingAfterOnDate('2026-11-09T09:00', departingDate)).toBe(false)
  })
})

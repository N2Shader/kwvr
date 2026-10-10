import { describe, expect, it } from 'vitest'
import { CalendarDate, Time } from '@internationalized/date'
import { getSearchCriteriaByFormValues } from '~/utils/searchCriteria'
import { haworthFixture, stationsFixture } from '../../fixtures/timetableFixtures'

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

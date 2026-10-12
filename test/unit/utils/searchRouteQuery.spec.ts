import { describe, expect, it } from 'vitest'
import { getRouteQueryBySearchCriteria, getSearchCriteriaByRouteQuery, getSearchQueryStringByCriteria } from '~/utils/searchRouteQuery'
import { haworthFixture, stationsFixture } from '../../fixtures/timetableFixtures'

const haworthCriteria = { origin: haworthFixture, departingAfter: '2026-10-12T14:30' }

describe('getRouteQueryBySearchCriteria', () => {
  it('puts the station, date and time in the query', () => {
    expect(getRouteQueryBySearchCriteria(haworthCriteria)).toEqual({ from: 'haworth', date: '2026-10-12', time: '14:30' })
  })
})

describe('getSearchQueryStringByCriteria', () => {
  it('writes the query as the router does, with the time\'s colon as it is', () => {
    expect(getSearchQueryStringByCriteria(haworthCriteria)).toBe('?from=haworth&date=2026-10-12&time=14:30')
  })
})

describe('getSearchCriteriaByRouteQuery', () => {
  it('reads back the search it was given', () => {
    expect(getSearchCriteriaByRouteQuery(getRouteQueryBySearchCriteria(haworthCriteria), stationsFixture)).toEqual(haworthCriteria)
  })

  it('rebuilds the time in the form\'s format, without seconds', () => {
    const routeQuery = { from: 'haworth', date: '2026-10-12', time: '14:30:45' }

    expect(getSearchCriteriaByRouteQuery(routeQuery, stationsFixture)?.departingAfter).toBe('2026-10-12T14:30')
  })

  it('gives nothing for a station that isn\'t in the list', () => {
    expect(getSearchCriteriaByRouteQuery({ from: 'leeds', date: '2026-10-12', time: '14:30' }, stationsFixture)).toBeUndefined()
  })

  it('gives nothing while the station, date or time is missing', () => {
    expect(getSearchCriteriaByRouteQuery({}, stationsFixture)).toBeUndefined()
    expect(getSearchCriteriaByRouteQuery({ date: '2026-10-12', time: '14:30' }, stationsFixture)).toBeUndefined()
    expect(getSearchCriteriaByRouteQuery({ from: 'haworth', time: '14:30' }, stationsFixture)).toBeUndefined()
    expect(getSearchCriteriaByRouteQuery({ from: 'haworth', date: '2026-10-12' }, stationsFixture)).toBeUndefined()
  })

  it('gives nothing for a part given twice (an array in the query)', () => {
    expect(getSearchCriteriaByRouteQuery({ from: 'haworth', date: ['2026-10-12', '2026-10-13'], time: '14:30' }, stationsFixture)).toBeUndefined()
    expect(getSearchCriteriaByRouteQuery({ from: ['haworth', 'keighley'], date: '2026-10-12', time: '14:30' }, stationsFixture)).toBeUndefined()
  })

  it('gives nothing for a date that doesn\'t exist', () => {
    expect(getSearchCriteriaByRouteQuery({ from: 'haworth', date: '2026-02-30', time: '14:30' }, stationsFixture)).toBeUndefined()
    expect(getSearchCriteriaByRouteQuery({ from: 'haworth', date: '12/10/2026', time: '14:30' }, stationsFixture)).toBeUndefined()
  })

  it('gives nothing for a time that doesn\'t exist', () => {
    expect(getSearchCriteriaByRouteQuery({ from: 'haworth', date: '2026-10-12', time: '25:00' }, stationsFixture)).toBeUndefined()
    expect(getSearchCriteriaByRouteQuery({ from: 'haworth', date: '2026-10-12', time: 'noon' }, stationsFixture)).toBeUndefined()
  })
})

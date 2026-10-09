import { describe, expect, it } from 'vitest'
import { CalendarDate, parseZonedDateTime } from '@internationalized/date'
import { getDepartureDefaultsByClock, getEarliestDepartureTimeByDate } from '~/utils/departureDefaults'

describe('getDepartureDefaultsByClock', () => {
  it('uses today at 09:00 before 09:00', () => {
    const departureDefaults = getDepartureDefaultsByClock(parseZonedDateTime('2026-10-09T07:15[Europe/London]'))

    expect(departureDefaults.date.toString()).toBe('2026-10-09')
    expect(departureDefaults.time.toString()).toBe('09:00:00')
  })

  it('uses today and the current time from 09:00', () => {
    const departureDefaults = getDepartureDefaultsByClock(parseZonedDateTime('2026-10-09T09:00[Europe/London]'))

    expect(departureDefaults.date.toString()).toBe('2026-10-09')
    expect(departureDefaults.time.toString()).toBe('09:00:00')
  })

  it('uses today and the current time during the day', () => {
    const departureDefaults = getDepartureDefaultsByClock(parseZonedDateTime('2026-10-09T14:30[Europe/London]'))

    expect(departureDefaults.date.toString()).toBe('2026-10-09')
    expect(departureDefaults.time.toString()).toBe('14:30:00')
  })

  it('still uses today and the current time one minute before 19:00', () => {
    const departureDefaults = getDepartureDefaultsByClock(parseZonedDateTime('2026-10-09T18:59[Europe/London]'))

    expect(departureDefaults.date.toString()).toBe('2026-10-09')
    expect(departureDefaults.time.toString()).toBe('18:59:00')
  })

  it('moves to tomorrow at 09:00 from 19:00', () => {
    const departureDefaults = getDepartureDefaultsByClock(parseZonedDateTime('2026-10-09T19:00[Europe/London]'))

    expect(departureDefaults.date.toString()).toBe('2026-10-10')
    expect(departureDefaults.time.toString()).toBe('09:00:00')
  })

  it('rolls over the month end', () => {
    const departureDefaults = getDepartureDefaultsByClock(parseZonedDateTime('2026-10-31T21:15[Europe/London]'))

    expect(departureDefaults.date.toString()).toBe('2026-11-01')
  })

  it('never allows a day before today, even after rolling to tomorrow', () => {
    const departureDefaults = getDepartureDefaultsByClock(parseZonedDateTime('2026-10-09T22:00[Europe/London]'))

    expect(departureDefaults.earliestDate.toString()).toBe('2026-10-09')
  })
})

describe('getEarliestDepartureTimeByDate', () => {
  const currentDateTime = parseZonedDateTime('2026-10-09T14:30:45[Europe/London]')

  it('limits today to the current minute', () => {
    expect(getEarliestDepartureTimeByDate(new CalendarDate(2026, 10, 9), currentDateTime)?.toString()).toBe('14:30:00')
  })

  it('has no limit for tomorrow', () => {
    expect(getEarliestDepartureTimeByDate(new CalendarDate(2026, 10, 10), currentDateTime)).toBeUndefined()
  })

  it('limits a stale earlier date to the current minute too', () => {
    expect(getEarliestDepartureTimeByDate(new CalendarDate(2026, 10, 8), currentDateTime)?.toString()).toBe('14:30:00')
  })
})

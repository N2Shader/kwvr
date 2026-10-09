import { describe, expect, it } from 'vitest'
import { parseZonedDateTime } from '@internationalized/date'
import { getDepartureDefaultsByClock } from '~/utils/departureDefaults'

describe('getDepartureDefaultsByClock', () => {
  it('uses today and the current time before 20:00', () => {
    const departureDefaults = getDepartureDefaultsByClock(parseZonedDateTime('2026-10-09T14:30[Europe/London]'))

    expect(departureDefaults.date.toString()).toBe('2026-10-09')
    expect(departureDefaults.time.toString()).toBe('14:30:00')
  })

  it('still uses today one minute before 20:00', () => {
    const departureDefaults = getDepartureDefaultsByClock(parseZonedDateTime('2026-10-09T19:59[Europe/London]'))

    expect(departureDefaults.date.toString()).toBe('2026-10-09')
  })

  it('moves to tomorrow from the start of the day at 20:00', () => {
    const departureDefaults = getDepartureDefaultsByClock(parseZonedDateTime('2026-10-09T20:00[Europe/London]'))

    expect(departureDefaults.date.toString()).toBe('2026-10-10')
    expect(departureDefaults.time.toString()).toBe('00:00:00')
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

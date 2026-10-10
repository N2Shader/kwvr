import { describe, expect, it } from 'vitest'
import { formatClockTime, formatJourneySummary, formatLongDate, formatResultsSummary, formatSearchingSummary, formatShortDate, formatStopCount, formatTimeOfDay } from '~/utils/timetableFormatting'
import { haworthFixture, keighleyFixture } from '../../fixtures/timetableFixtures'

describe('formatStopCount', () => {
  it('describes zero stops as direct', () => {
    expect(formatStopCount(0)).toBe('Direct')
  })

  it('uses the singular for one stop', () => {
    expect(formatStopCount(1)).toBe('1 stop')
  })

  it('uses the plural for several stops', () => {
    expect(formatStopCount(4)).toBe('4 stops')
  })
})

describe('formatClockTime', () => {
  it('formats a local ISO date-time as a 24-hour clock time', () => {
    expect(formatClockTime('2026-04-24T12:20')).toBe('12:20')
  })

  it('pads single-digit hours', () => {
    expect(formatClockTime('2026-04-24T09:05')).toBe('09:05')
  })

  it('shows midnight as 00:00', () => {
    expect(formatClockTime('2026-04-24T00:00')).toBe('00:00')
  })
})

describe('formatLongDate', () => {
  it('formats a local ISO date-time as a British long date', () => {
    expect(formatLongDate('2026-04-24T12:00')).toBe('24 April 2026')
  })
})

describe('formatResultsSummary', () => {
  it('reports when nothing was found', () => {
    expect(formatResultsSummary(0)).toBe('No services found')
  })

  it('uses the singular for one service', () => {
    expect(formatResultsSummary(1)).toBe('1 service found')
  })

  it('uses the plural for several services', () => {
    expect(formatResultsSummary(5)).toBe('5 services found')
  })
})

describe('formatSearchingSummary', () => {
  it('names the station being searched from', () => {
    expect(formatSearchingSummary('Haworth')).toBe('Searching for departures from Haworth…')
  })
})

describe('formatShortDate', () => {
  it('formats a calendar date with a short weekday and month', () => {
    expect(formatShortDate({ year: 2026, month: 10, day: 9 })).toBe('Fri, 9 Oct 2026')
  })
})

describe('formatTimeOfDay', () => {
  it('zero-pads the hour and minute', () => {
    expect(formatTimeOfDay({ hour: 9, minute: 5 })).toBe('09:05')
  })

  it('keeps two-digit values as they are', () => {
    expect(formatTimeOfDay({ hour: 14, minute: 30 })).toBe('14:30')
  })
})

describe('formatJourneySummary', () => {
  it('names both ends of the journey with their times', () => {
    const journey = { origin: haworthFixture, destination: keighleyFixture, departsAt: '2026-10-10T10:22', arrivesAt: '2026-10-10T10:43' }

    expect(formatJourneySummary(journey)).toBe('Haworth 10:22 to Keighley 10:43')
  })
})

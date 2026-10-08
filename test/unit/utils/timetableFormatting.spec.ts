import { describe, expect, it } from 'vitest'
import { formatClockTime, formatLongDate, formatResultsSummary, formatStopCount } from '~/utils/timetableFormatting'

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

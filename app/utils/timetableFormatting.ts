// Pure display formatters for timetable data. Date-times are local ISO strings without an
// offset, so parsing and formatting both happen in the same (local) zone.

const clockTimeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const longDateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/** `0` → "Direct", `1` → "1 stop", `4` → "4 stops" */
export const formatStopCount = (stopCount: number): string => {
  if (stopCount === 0) return 'Direct'
  return stopCount === 1 ? '1 stop' : `${stopCount} stops`
}

/** `2026-04-24T12:20` → "12:20" */
export const formatClockTime = (isoDateTime: string): string => clockTimeFormatter.format(new Date(isoDateTime))

/** `2026-04-24T12:20` → "24 April 2026" */
export const formatLongDate = (isoDateTime: string): string => longDateFormatter.format(new Date(isoDateTime))

/** `5` → "5 services found", `1` → "1 service found", `0` → "No services found" */
export const formatResultsSummary = (serviceCount: number): string => {
  if (serviceCount === 0) return 'No services found'
  return serviceCount === 1 ? '1 service found' : `${serviceCount} services found`
}

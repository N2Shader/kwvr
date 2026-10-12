import { parseDate, parseTime } from '@internationalized/date'
import type { LocationQuery } from 'vue-router'
import type { Station, TimetableSearchCriteria } from '~/types/timetable'
import { formatTimeOfDay } from '~/utils/timetableFormatting'

/**
 * A search as it shows in the address bar, e.g. `/?from=haworth&date=2026-10-12&time=14:30`, so it can be shared as a link.
 * A type, not an interface, so it fits the router's query type (which has an index signature).
 */
export type SearchRouteQuery = {
  from: string
  date: string
  time: string
}

/** A search → its address bar query, e.g. Haworth at `2026-10-12T14:30` → `{ from: 'haworth', date: '2026-10-12', time: '14:30' }` */
export const getRouteQueryBySearchCriteria = ({ origin, departingAfter }: TimetableSearchCriteria): SearchRouteQuery => ({
  from: origin.id,
  date: departingAfter.slice(0, 10),
  time: departingAfter.slice(11),
})

/**
 * The address bar's query → the search it holds, or `undefined` when it holds none: an unknown station,
 * a missing or repeated part, or a date or time that doesn't exist (e.g. `2026-02-30`, `25:00`).
 * It doesn't read the clock (safe during SSR): whether the day or time has gone is the form's check.
 */
export const getSearchCriteriaByRouteQuery = (routeQuery: LocationQuery, stations: Station[]): TimetableSearchCriteria | undefined => {
  const { from, date, time } = routeQuery
  const origin = stations.find(station => station.id === from)
  if (!origin || typeof date !== 'string' || typeof time !== 'string') return undefined

  try {
    // Rebuilt in the form's own format, so a search from a link and the same search from the form are equal
    return { origin, departingAfter: `${parseDate(date).toString()}T${formatTimeOfDay(parseTime(time))}` }
  }
  catch {
    return undefined
  }
}

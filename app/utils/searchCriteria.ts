import type { CalendarDate } from '@internationalized/date'
import type { Station, TimetableSearchCriteria, TimetableSearchFormValues } from '~/types/timetable'
import { formatTimeOfDay } from '~/utils/timetableFormatting'

/**
 * The search form's values → what a search sends, e.g. Haworth, 9 October 2026, 14:30 →
 * `{ origin: Haworth, departingAfter: '2026-10-09T14:30' }`. `undefined` while anything is missing.
 */
export const getSearchCriteriaByFormValues = (
  { originId, departingDate, departingTime }: TimetableSearchFormValues,
  stations: Station[],
): TimetableSearchCriteria | undefined => {
  const origin = stations.find(station => station.id === originId)
  if (!origin || !departingDate || !departingTime) return undefined

  return { origin, departingAfter: `${departingDate.toString()}T${formatTimeOfDay(departingTime)}` }
}

/** Two searches ask the same thing: same station, same date and time */
export const isSameSearchCriteria = (firstCriteria: TimetableSearchCriteria, secondCriteria: TimetableSearchCriteria) =>
  firstCriteria.origin.id === secondCriteria.origin.id && firstCriteria.departingAfter === secondCriteria.departingAfter

/** A search's `departingAfter` (e.g. `2026-10-09T14:30`) falls on the given day */
export const isDepartingAfterOnDate = (departingAfter: string, date: CalendarDate) =>
  departingAfter.startsWith(`${date.toString()}T`)

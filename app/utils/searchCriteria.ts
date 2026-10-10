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

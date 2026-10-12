import type { TimetableApiResponse } from '~/types/timetableApi'
import dummyTimetableResponse from '../data/dummy-timetable-response.json'

export interface TimetableApiQuery {
  originId: string
  departingAfter: string
}

// TEMPORARY: true makes the external API "fail", to check the error path (our endpoint's 502 → the error state)
const SIMULATE_TIMETABLE_API_ERROR = false

/**
 * Asks the external timetable API for the services matching the search. Throws when the API answers
 * with an error (or can't be reached), like `$fetch` does, so the endpoint can pass the failure on.
 * The API isn't built yet: until then the answer is the dummy response (the orange timetable, whole),
 * and the query is ignored (the front end picks the matching services, getTrainServicesByCriteria).
 */
export const fetchTimetableByQuery = async (query: TimetableApiQuery): Promise<TimetableApiResponse> => {
  if (SIMULATE_TIMETABLE_API_ERROR) {
    throw createError({ statusCode: 503, statusMessage: `Timetable API unavailable for ${query.originId} (simulated)` })
  }
  // A JSON import widens its strings (e.g. `timeType` to string), so it's typed here; the real call will be $fetch<TimetableApiResponse>
  return dummyTimetableResponse as TimetableApiResponse
}

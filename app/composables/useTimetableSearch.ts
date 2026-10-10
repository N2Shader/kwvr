import type { TimetableSearchCriteria, TimetableSearchState } from '~/types/timetable'
import type { TimetableApiResponse } from '~/types/timetableApi'

/**
 * Runs a search for the page: the search box's criteria go to our endpoint (/api/timetable/search),
 * which will call the external timetable API, and the answer becomes the page state.
 * The latest search wins: an earlier request that answers late is ignored.
 * A search already on screen (or still loading) isn't sent again; one that failed is.
 */
export const useTimetableSearch = () => {
  // Shallow: the state is replaced whole, never changed in place, so `criteria` stays the very object
  // the search started with (a deep ref would hand back a proxy, and isLatestSearch compares identity)
  const searchState = shallowRef<TimetableSearchState>({ status: 'first-use' })

  // Only the search still loading may write its outcome
  const isLatestSearch = (criteria: TimetableSearchCriteria) =>
    searchState.value.status === 'loading' && searchState.value.criteria === criteria

  // The same station, date and time as the search loading or shown (after an error, a repeat is the retry)
  const isSearchOnScreen = (criteria: TimetableSearchCriteria) =>
    searchState.value.status !== 'first-use'
    && searchState.value.status !== 'error'
    && isSameSearchCriteria(searchState.value.criteria, criteria)

  const searchTimetableByCriteria = async (criteria: TimetableSearchCriteria) => {
    if (isSearchOnScreen(criteria)) return

    searchState.value = { status: 'loading', criteria }

    try {
      const timetableResponse = await $fetch<TimetableApiResponse>('/api/timetable/search', {
        query: { originId: criteria.origin.id, departingAfter: criteria.departingAfter },
      })
      if (!isLatestSearch(criteria)) return

      // The endpoint sends the whole timetable for now, so the search's services are picked here
      const services = getTrainServicesByCriteria(timetableResponse, criteria)
      searchState.value = services.length > 0
        ? { status: 'results', criteria, services }
        : { status: 'no-results', criteria }
    }
    catch {
      if (isLatestSearch(criteria)) searchState.value = { status: 'error', criteria }
    }
  }

  // Back to the station cards (the error state's way home)
  const resetTimetableSearch = () => {
    searchState.value = { status: 'first-use' }
  }

  return { searchState, searchTimetableByCriteria, resetTimetableSearch }
}

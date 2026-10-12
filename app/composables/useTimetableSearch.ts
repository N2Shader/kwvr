import type { TimetableSearchCriteria, TimetableSearchState } from '~/types/timetable'
import type { TimetableApiResponse } from '~/types/timetableApi'

// A search that hasn't answered by then fails (the error state, with its retry) instead of loading forever
const SEARCH_REQUEST_TIMEOUT_MS = 15_000

/**
 * Runs a search for the page: the search box's criteria go to our endpoint (/api/timetable/search),
 * which will call the external timetable API, and the answer becomes the page state.
 * The latest search wins: an earlier request that answers late is ignored.
 * A search already on screen (or still loading) isn't sent again; one that failed is.
 * `linkedCriteria` is a search from the address bar (a shared link): the page starts on it, shown as
 * loading, until the form has checked it and sent it (or refused it).
 */
export const useTimetableSearch = (linkedCriteria?: TimetableSearchCriteria) => {
  // Shallow: the state is replaced whole, never changed in place, so `criteria` stays the very object
  // the search started with (a deep ref would hand back a proxy, and isLatestSearch compares identity)
  const searchState = shallowRef<TimetableSearchState>(
    linkedCriteria ? { status: 'checking-link', criteria: linkedCriteria } : { status: 'first-use' },
  )

  // Only the search still loading may write its outcome
  const isLatestSearch = (criteria: TimetableSearchCriteria) =>
    searchState.value.status === 'loading' && searchState.value.criteria === criteria

  // The same station, date and time as the search loading or shown. After an error a repeat is the retry,
  // and a link's search that hasn't been sent yet does go out.
  const isSearchOnScreen = (criteria: TimetableSearchCriteria) => {
    const state = searchState.value
    return (state.status === 'loading' || state.status === 'results' || state.status === 'no-results')
      && isSameSearchCriteria(state.criteria, criteria)
  }

  const searchTimetableByCriteria = async (criteria: TimetableSearchCriteria) => {
    if (isSearchOnScreen(criteria)) return

    searchState.value = { status: 'loading', criteria }

    try {
      const timetableResponse = await $fetch<TimetableApiResponse>('/api/timetable/search', {
        query: { originId: criteria.origin.id, departingAfter: criteria.departingAfter },
        timeout: SEARCH_REQUEST_TIMEOUT_MS,
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

  // Back to the station cards (the error and no-results states' way home, a refused link, Back to `/`)
  const resetTimetableSearch = () => {
    searchState.value = { status: 'first-use' }
  }

  return { searchState, searchTimetableByCriteria, resetTimetableSearch, isSearchOnScreen }
}

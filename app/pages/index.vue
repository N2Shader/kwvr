<script setup lang="ts">
import type { Station, TimetableSearchCriteria } from '~/types/timetable'
import { placeholderSearchDefaults, placeholderStations } from '~/data/placeholderTimetable'
import { stationHighlights } from '~/data/stationHighlights'

useHead({ title: 'Find train times — Keighley & Worth Valley Railway' })

const route = useRoute()

// The search in the address bar, e.g. `/?from=haworth&date=2026-10-12&time=14:30` (a shared link, Back/Forward)
const addressBarCriteria = computed(() => getSearchCriteriaByRouteQuery(route.query, placeholderStations))

// Search box → useTimetableSearch → /api/timetable/search → the external timetable API.
// A link's search shows as loading from the first paint, until the form checks it (see onMounted).
const { searchState, searchTimetableByCriteria, resetTimetableSearch, isSearchOnScreen } = useTimetableSearch(addressBarCriteria.value)

const resultsSummary = computed(() => {
  const state = searchState.value
  if (state.status === 'loading' || state.status === 'checking-link') return formatSearchingSummary(state.criteria.origin.name)
  if (state.status === 'results') return formatResultsSummary(state.services.length)
  if (state.status === 'no-results') return 'Sorry, there are no trains at that time.'
  if (state.status === 'error') return 'Sorry, we couldn’t load the timetable.'
  return ''
})

// Station cards and the address bar search through the form, so the form shows the station, date and time searched
const timetableSearchForm = useTemplateRef<{
  searchNextTrainFromStation: (station: Station) => void
  searchFromAddressBar: (criteria: TimetableSearchCriteria) => Promise<boolean>
  focusSearchForm: () => void
}>('timetableSearchForm')

// Each search goes in the address bar, ready to share, as a new history entry (Back goes to the previous search).
// A query-only change neither scrolls nor remounts the page.
const searchAndShowInAddressBar = (criteria: TimetableSearchCriteria) => {
  // Not awaited: it skips a search already on screen and retries one that failed
  searchTimetableByCriteria(criteria)
  const shownCriteria = addressBarCriteria.value
  if (shownCriteria && isSameSearchCriteria(shownCriteria, criteria)) return
  navigateTo({ query: getRouteQueryBySearchCriteria(criteria) })
}

// A search from the address bar goes through the form, so the form shows it and checks it like Search.
// A stale one (a day or time already gone) is refused there, with its errors, and the station cards show;
// the address bar keeps it, as it matches what the form shows.
const searchFromAddressBar = async (criteria: TimetableSearchCriteria) => {
  const isSearchSent = await timetableSearchForm.value?.searchFromAddressBar(criteria)
  if (!isSearchSent) resetTimetableSearch()
}

// A link's search is checked against the user's clock, so in the browser only. The form's own prefill
// (its onMounted, which runs first) is already done, so the link's values replace it.
onMounted(() => {
  if (searchState.value.status === 'checking-link') searchFromAddressBar(searchState.value.criteria)
})

// Back and Forward bring that search back (or the station cards, at `/`). Our own push lands with its
// search already loading, so it's left alone.
watch(addressBarCriteria, (criteria) => {
  if (!criteria) {
    resetTimetableSearch()
    return
  }
  if (!isSearchOnScreen(criteria)) searchFromAddressBar(criteria)
})

// The error and no-results states' button: back to the station cards and a bare `/`, with focus on the
// search box (the button is gone)
const returnHomeToStationCards = async () => {
  resetTimetableSearch()
  await navigateTo({ query: {} })
  await nextTick()
  timetableSearchForm.value?.focusSearchForm()
}
</script>

<template>
  <div class="timetable-page">
    <TimetableSearchHero>
      <TimetableSearchForm
        ref="timetableSearchForm"
        :stations="placeholderStations"
        :default-criteria="placeholderSearchDefaults"
        @search="searchAndShowInAddressBar"
      />
    </TimetableSearchHero>

    <!-- Always rendered, so screen readers hear the search start and the count when results arrive -->
    <p
      class="results-summary visually-hidden"
      aria-live="polite"
    >
      {{ resultsSummary }}
    </p>

    <!--
      One state at a time, in an area that never gets shorter than the screen while loading or showing results (see the styles).
      A link's search not yet checked shows as loading, in the same branch, so nothing remounts once it's sent.
    -->
    <div
      class="timetable-page-content"
      :class="{ 'is-screen-tall': searchState.status === 'loading' || searchState.status === 'checking-link' || searchState.status === 'results' }"
    >
      <TimetableFirstUseState
        v-if="searchState.status === 'first-use'"
        :station-highlights="stationHighlights"
        @select-station="timetableSearchForm?.searchNextTrainFromStation($event)"
      />
      <TimetableLoadingState
        v-else-if="searchState.status === 'loading' || searchState.status === 'checking-link'"
        :criteria="searchState.criteria"
      />
      <TimetableResultsState
        v-else-if="searchState.status === 'results'"
        :criteria="searchState.criteria"
        :services="searchState.services"
      />
      <TimetableNoResultsState
        v-else-if="searchState.status === 'no-results'"
        @return-home="returnHomeToStationCards"
      />
      <TimetableErrorState
        v-else
        @return-home="returnHomeToStationCards"
      />
    </div>
  </div>
</template>

<style scoped>
/* Passes the remaining height down, so the content area can fill it */
.timetable-page {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/*
 * Fills down to the footer on a short page. At least one screen tall while loading and with results,
 * so swapping states (e.g. the tall station bento for the shorter loading skeleton) never pulls the
 * footer up into view. The other states (first use, no results, error) take their natural height,
 * so the short ones don't leave a big empty band above the footer. svh, so the mobile URL bar
 * showing or hiding doesn't resize it.
 */
.timetable-page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.timetable-page-content.is-screen-tall {
  min-height: 100vh;
  min-height: 100svh;
}
</style>

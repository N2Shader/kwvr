<script setup lang="ts">
import type { Station } from '~/types/timetable'
import { placeholderSearchDefaults, placeholderStations } from '~/data/placeholderTimetable'
import { stationHighlights } from '~/data/stationHighlights'

useHead({ title: 'Find train times — Keighley & Worth Valley Railway' })

// Search box → useTimetableSearch → /api/timetable/search → the external timetable API
const { searchState, searchTimetableByCriteria } = useTimetableSearch()

const resultsSummary = computed(() => {
  const state = searchState.value
  if (state.status === 'loading') return formatSearchingSummary(state.criteria.origin.name)
  if (state.status === 'results') return formatResultsSummary(state.services.length)
  if (state.status === 'no-results') return formatResultsSummary(0)
  // The error announcement comes with that state's design
  return ''
})

// A station card searches through the form, so the form shows the station, date and time searched
const timetableSearchForm = useTemplateRef<{ searchNextTrainFromStation: (station: Station) => void }>('timetableSearchForm')
</script>

<template>
  <div class="timetable-page">
    <TimetableSearchHero>
      <TimetableSearchForm
        ref="timetableSearchForm"
        :stations="placeholderStations"
        :default-criteria="placeholderSearchDefaults"
        @search="searchTimetableByCriteria"
      />
    </TimetableSearchHero>

    <!-- Always rendered, so screen readers hear the search start and the count when results arrive -->
    <p
      class="results-summary visually-hidden"
      aria-live="polite"
    >
      {{ resultsSummary }}
    </p>

    <TimetableFirstUseState
      v-if="searchState.status === 'first-use'"
      :station-highlights="stationHighlights"
      @select-station="timetableSearchForm?.searchNextTrainFromStation($event)"
    />
    <TimetableLoadingState v-else-if="searchState.status === 'loading'" />
    <TimetableResultsState
      v-else-if="searchState.status === 'results'"
      :criteria="searchState.criteria"
      :services="searchState.services"
    />
    <TimetableNoResultsState v-else-if="searchState.status === 'no-results'" />
    <TimetableErrorState v-else />
  </div>
</template>

<style scoped>
/* Passes the remaining height down, so the first-use state can fill it */
.timetable-page {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

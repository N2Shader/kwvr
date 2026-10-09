<script setup lang="ts">
import type { Station, TimetableSearchState } from '~/types/timetable'
import { placeholderSearchDefaults, placeholderStations } from '~/data/placeholderTimetable'
import { stationHighlights } from '~/data/stationHighlights'

useHead({ title: 'Find train times — Keighley & Worth Valley Railway' })

// The state lives here until the API search composable takes it over
const searchState = ref<TimetableSearchState>({ status: 'first-use' })

const resultsSummary = computed(() => {
  const state = searchState.value
  if (state.status === 'results') return formatResultsSummary(state.services.length)
  if (state.status === 'no-results') return formatResultsSummary(0)
  // Loading and error announcements come with those states' designs
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
      />
    </TimetableSearchHero>

    <!-- Always rendered, so screen readers hear the count when results change -->
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
    <TimetableResultsState v-else-if="searchState.status === 'results'" />
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

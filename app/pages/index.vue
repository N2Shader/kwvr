<script setup lang="ts">
import type { TrainService } from '~/types/timetable'
import {
  placeholderAttractions,
  placeholderSearchCriteria,
  // placeholderServices,
  placeholderStationDetails,
  placeholderStations,
} from '~/data/placeholderTimetable'

useHead({ title: 'Find train times — Keighley & Worth Valley Railway' })

// No API or search yet, so the page starts on the empty state.
// "With results" state (placeholder data): uncomment the `placeholderServices` import above
// and the line below, then remove the empty array.
// const services = placeholderServices
const services: TrainService[] = []
const hasServices = services.length > 0
const resultsSummary = formatResultsSummary(services.length)
</script>

<template>
  <div class="timetable-page">
    <TimetableSearchHero>
      <TimetableSearchForm
        :stations="placeholderStations"
        :default-criteria="placeholderSearchCriteria"
      />
    </TimetableSearchHero>

    <!-- Always rendered, so screen readers hear the count when results change -->
    <p
      class="visually-hidden"
      aria-live="polite"
    >
      {{ resultsSummary }}
    </p>

    <template v-if="hasServices">
      <TimetableResults
        :services="services"
        :search-criteria="placeholderSearchCriteria"
      />
      <StationInfo :details="placeholderStationDetails" />
      <StationAttractions
        :station-name="placeholderStationDetails.station.name"
        :attractions="placeholderAttractions"
      />
    </template>
    <TimetableEmptyState v-else />
  </div>
</template>

<style scoped>
/* Passes the remaining height down, so the empty state can fill it */
.timetable-page {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

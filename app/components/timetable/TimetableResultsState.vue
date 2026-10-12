<script setup lang="ts">
import type { TimetableSearchCriteria, TrainService } from '~/types/timetable'
import { stationDetailsList } from '~/data/stationDetails'
import { stationHighlights } from '~/data/stationHighlights'

const props = defineProps<{
  criteria: TimetableSearchCriteria
  services: TrainService[]
}>()

const originStationDetails = computed(() =>
  stationDetailsList.find(details => details.station.id === props.criteria.origin.id))

/*
 * Three other stations at random, never the searched one. Random in setup is safe: this state never
 * renders on the server (the page starts on first use and searches run in the browser), so there's no
 * hydration to disagree with. A new search remounts this state after loading, so the cards change.
 */
const suggestedStationHighlights = computed(() =>
  pickRandomStationHighlights(stationHighlights, { excludedStationId: props.criteria.origin.id, count: 3 }))
</script>

<template>
  <div class="results-state">
    <!-- A div, not a section: TimetableResults is already the section, under its own heading -->
    <TimetableResults
      :services="services"
      :search-criteria="criteria"
    />
    <!-- What the symbols in the Info column mean -->
    <TimetableResultsKey :services="services" />
    <!-- The searched station: about it, things to do, a map -->
    <StationInfo
      v-if="originStationDetails"
      :details="originStationDetails"
    />
    <!-- Three other stations, each opening its page on kwvr.co.uk -->
    <StationSuggestions :highlights="suggestedStationHighlights" />
  </div>
</template>

<script setup lang="ts">
import type { TimetableSearchCriteria, TrainService } from '~/types/timetable'

defineProps<{
  criteria: TimetableSearchCriteria
  services: TrainService[]
}>()
</script>

<template>
  <div class="results-state">
    <!--
      A div, not a section: TimetableResults is already the section, under its own heading.
      StationInfo and StationAttractions for the searched station join here later.
    -->
    <TimetableResults
      :services="services"
      :search-criteria="criteria"
    />
    <!-- What the symbols in the Info column mean -->
    <TimetableResultsKey :services="services" />
  </div>
</template>

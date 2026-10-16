<script setup lang="ts">
import type { TrainServiceNote } from '~/types/timetable'

defineProps<{
  stationName: string
  /** Local ISO date-time without offset, e.g. `2026-04-24T12:20` */
  dateTime: string
  /** The station's own symbols, beside its name (a line end's, e.g. National Rail connections at Keighley) */
  notes?: TrainServiceNote[]
}>()
</script>

<!-- A result's origin or destination cell: the station (with its symbols, if any), then its departure or arrival time -->
<template>
  <span class="result-station">
    {{ stationName }}
    <span
      v-if="notes && notes.length > 0"
      class="result-station-notes"
    >
      <TimetableNoteIcon
        v-for="note in notes"
        :key="note.code"
        :note="note"
      />
    </span>
  </span>
  <time
    :datetime="dateTime"
    class="result-time"
  >{{ formatClockTime(dateTime) }}</time>
</template>

<style scoped>
.result-station,
.result-time {
  display: block;
}

.result-station {
  font-size: var(--font-size-lg);
}

/* Inline, so it follows the name in either cell's alignment (start for the origin, end for the destination) */
.result-station-notes {
  display: inline-flex;
  gap: var(--space-2);
  margin-inline-start: var(--space-1);
  vertical-align: middle;
}
</style>

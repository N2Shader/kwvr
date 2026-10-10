<script setup lang="ts">
import type { TrainServiceNote } from '~/types/timetable'

defineProps<{
  stopCount: number
  hasServiceAlert: boolean
  notes: TrainServiceNote[]
}>()
</script>

<!-- A result's info cell: the stop count, the timetable symbols, and the service alert if there is one -->
<template>
  <span class="result-stops">{{ formatStopCount(stopCount) }}</span>
  <!--
    Each symbol's alt text says what it means, and a tooltip shows it on hover; the key under the
    results spells them out for everyone
  -->
  <span
    v-if="notes.length > 0"
    class="result-notes"
  >
    <TimetableNoteIcon
      v-for="note in notes"
      :key="note.code"
      :note="note"
    />
  </span>
  <!-- Text label, so the alert isn't conveyed by the row colour alone -->
  <strong
    v-if="hasServiceAlert"
    class="result-alert"
  >Service alert</strong>
</template>

<style scoped>
.result-stops,
.result-alert {
  display: block;
}

.result-notes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.result-alert {
  font-weight: var(--font-weight-semibold);
  color: var(--colour-text-accent);
}
</style>

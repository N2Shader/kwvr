<script setup lang="ts">
import type { TrainService } from '~/types/timetable'

// A result row's one click and focus target. Its hit area is stretched over the whole row
// (the row is the overlay's containing block, see TimetableResults), like StationBentoCard's button.
defineProps<{
  service: TrainService
}>()

const emit = defineEmits<{
  'open-journey': [trigger: HTMLButtonElement]
}>()

const openJourney = (event: MouseEvent) => {
  emit('open-journey', event.currentTarget as HTMLButtonElement)
}
</script>

<template>
  <button
    type="button"
    aria-haspopup="dialog"
    class="result-journey-button"
    @click="openJourney"
  >
    <span class="visually-hidden">Journey details: {{ formatJourneySummary(service) }}{{ service.isLastTrain ? ', last train' : '' }}</span>
  </button>
</template>

<style scoped>
/*
 * Static, not .visually-hidden: `clip` would clip the overlay too. A zero-height block, so it adds no
 * line before the station name; the overlay's size comes from the row, not from the button.
 * The row's text sits under the overlay and the symbol icons above it (TimetableResults).
 */
.result-journey-button {
  display: block;
  width: 100%;
  height: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}

.result-journey-button::after {
  content: '';
  position: absolute;
  inset: 0;
}

/*
 * The focus ring goes round the whole row (the button's hit area), not the empty button. Inset,
 * because UTable clips the table's overflow.
 */
.result-journey-button:focus-visible {
  outline: none;
}

.result-journey-button:focus-visible::after {
  outline: var(--focus-ring-width) solid var(--colour-focus-ring);
  outline-offset: calc(var(--focus-ring-width) * -1);
  border-radius: var(--radius-sm);
}
</style>

<script setup lang="ts">
import type { Station, StationHighlight } from '~/types/timetable'

defineProps<{
  stationHighlights: StationHighlight[]
}>()

const emit = defineEmits<{
  'select-station': [station: Station]
}>()

const headingId = useId()
</script>

<template>
  <section
    class="first-use-state"
    :aria-labelledby="headingId"
  >
    <!-- No search yet: the search box above, or one tap for the next train from a station -->
    <UContainer>
      <h2
        :id="headingId"
        class="first-use-state-heading"
      >
        Or catch the next train from…
      </h2>
      <StationBento
        :highlights="stationHighlights"
        @select-station="emit('select-station', $event)"
      />
    </UContainer>
  </section>
</template>

<style scoped>
.first-use-state {
  /* Grows to fill the page's content area down to the footer on a short page */
  flex: 1;
  padding-block: var(--space-6) var(--space-8);
  background-color: var(--colour-surface-alt);
  /* The bento cards start outside their grid (useStationBentoEntranceMotion): never a sideways scroll */
  overflow-x: clip;
}

.first-use-state-heading {
  margin-block-end: var(--space-5);
}
</style>

<script setup lang="ts">
import type { StationHighlight } from '~/types/timetable'

defineProps<{
  highlights: StationHighlight[]
}>()
</script>

<template>
  <UContainer
    as="section"
    class="station-suggestions"
  >
    <!-- The design has no visible heading here; this one names the section for screen readers -->
    <h2 class="visually-hidden">
      More stations to explore
    </h2>
    <ul class="station-suggestion-list">
      <StationSuggestionCard
        v-for="highlight in highlights"
        :key="highlight.station.id"
        :highlight="highlight"
      />
    </ul>
  </UContainer>
</template>

<style scoped>
.station-suggestions {
  padding-block: var(--space-6) var(--space-8);
}

/* Mobile first: one centred column; three columns from tablet up (keep StationSuggestionCard's `sizes` in sync) */
.station-suggestion-list {
  display: grid;
  grid-template-columns: minmax(0, 22rem);
  justify-content: center;
  gap: var(--space-5);
  padding: 0;
  list-style: none;
}

@media (min-width: 48rem) {
  .station-suggestion-list {
    grid-template-columns: repeat(3, minmax(0, 20rem));
  }
}
</style>

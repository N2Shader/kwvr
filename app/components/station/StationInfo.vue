<script setup lang="ts">
import type { StationDetails } from '~/types/timetable'

defineProps<{
  details: StationDetails
}>()
</script>

<template>
  <UContainer
    as="section"
    class="station-info"
  >
    <div class="station-info-text">
      <h2 class="station-info-heading">
        {{ details.station.name }} Station
      </h2>
      <p>{{ details.description }}</p>
    </div>
    <!-- Placeholder until the map is built; not focusable, so moving it with `order` is safe -->
    <div class="station-map">
      <p>Map coming soon</p>
    </div>
  </UContainer>
</template>

<style scoped>
/* Mobile first: map above, centred heading, left-aligned body text */
.station-info {
  display: grid;
  gap: var(--space-5);
  padding-block: var(--space-7);
}

.station-info-heading {
  margin-bottom: var(--space-3);
  text-align: center;
}

.station-info-text p {
  max-width: 65ch;
}

.station-map {
  display: grid;
  place-items: center;
  order: -1;
  aspect-ratio: 5 / 3;
  background-color: var(--colour-surface-alt);
  border: 1px solid var(--colour-border);
}

@media (min-width: 48rem) {
  .station-info {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: var(--space-7);
  }

  .station-info-heading {
    text-align: start;
  }

  .station-map {
    order: 0;
  }
}
</style>

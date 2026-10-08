<script setup lang="ts">
import type { StationAttraction } from '~/types/timetable'

defineProps<{
  stationName: string
  attractions: StationAttraction[]
}>()
</script>

<template>
  <section class="station-attractions container">
    <h2 class="visually-hidden">
      Things to see near {{ stationName }}
    </h2>
    <ul class="attraction-list">
      <li
        v-for="attraction in attractions"
        :key="attraction.id"
      >
        <StationAttractionCard :attraction="attraction" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.station-attractions {
  padding-block: var(--space-6) var(--space-8);
}

/* Mobile first: one centred column; three columns from tablet up */
.attraction-list {
  display: grid;
  grid-template-columns: minmax(0, 22rem);
  justify-content: center;
  gap: var(--space-5);
  padding: 0;
  list-style: none;
}

@media (min-width: 48rem) {
  .attraction-list {
    grid-template-columns: repeat(3, minmax(0, 20rem));
  }
}
</style>

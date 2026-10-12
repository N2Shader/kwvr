<script setup lang="ts">
import type { StationDetails } from '~/types/timetable'

const props = defineProps<{
  details: StationDetails
}>()

// Google's key-free embed (the project has no Maps API key), pinned on the station
const mapEmbedSrc = computed(() => {
  const { latitude, longitude } = props.details.mapLocation
  return `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&hl=en-GB&output=embed`
})
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
      <template v-if="details.thingsToDo.length">
        <h3 class="station-info-subheading">
          Things to do
        </h3>
        <ul class="station-things-to-do">
          <li
            v-for="thingToDo in details.thingsToDo"
            :key="thingToDo"
          >
            {{ thingToDo }}
          </li>
        </ul>
      </template>
    </div>
    <!--
      Lazy: it sits below the results, so Google's map never slows the first paint.
      The only focusable thing in the section, so moving it with `order` keeps the focus order.
    -->
    <iframe
      :src="mapEmbedSrc"
      :title="`Map of ${details.station.name} station`"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      class="station-map"
    />
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

.station-info-text p,
.station-things-to-do {
  max-width: 65ch;
}

.station-info-subheading {
  margin-block: var(--space-5) var(--space-2);
}

.station-things-to-do {
  display: grid;
  gap: var(--space-1);
  padding-inline-start: var(--space-5);
  list-style: disc;
}

.station-map {
  display: block;
  order: -1;
  width: 100%;
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

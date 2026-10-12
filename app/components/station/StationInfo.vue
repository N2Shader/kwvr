<script setup lang="ts">
import type { StationDetails } from '~/types/timetable'

const props = defineProps<{
  details: StationDetails
}>()

// Google's key-free embed, pinned on the station, and the same place on Google Maps itself, for anyone
// who'd rather not load the map here (utils/stationMapLinks.ts)
const mapEmbedSrc = computed(() => getMapEmbedSrcByLocation(props.details.mapLocation))
const mapLinkHref = computed(() => getMapLinkHrefByLocation(props.details.mapLocation))

/*
 * Click to load: the map only loads (with Google's scripts and cookies) once asked for, so nothing reaches
 * Google without the user's say-so, and its weight never lands on a results page that doesn't need it.
 * Focus then moves into the map, as the button it replaces is gone.
 */
const isMapShown = ref(false)
const stationMapFrame = useTemplateRef<HTMLIFrameElement>('stationMapFrame')

const showStationMap = async () => {
  isMapShown.value = true
  await nextTick()
  stationMapFrame.value?.focus()
}
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
      The section's only focusable things are in here, so moving it with `order` keeps the focus order.
      Referrer: our origin only, so the search in our address bar never reaches Google.
    -->
    <div class="station-map">
      <iframe
        v-if="isMapShown"
        ref="stationMapFrame"
        :src="mapEmbedSrc"
        :title="`Map of ${details.station.name} station`"
        referrerpolicy="strict-origin-when-cross-origin"
        class="station-map-frame"
      />
      <div
        v-else
        class="station-map-placeholder"
      >
        <p>The map comes from Google Maps, which may set cookies.</p>
        <UButton
          class="button-primary"
          @click="showStationMap"
        >
          Show map<span class="visually-hidden"> of {{ details.station.name }} station</span>
        </UButton>
        <a
          :href="mapLinkHref"
          target="_blank"
          rel="noopener noreferrer"
          class="station-map-link"
        >Open in Google Maps<span class="visually-hidden"> (opens in a new tab)</span></a>
      </div>
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

/* The map's box: the same 5:3 before and after it loads, so nothing moves when it does */
.station-map {
  order: -1;
  width: 100%;
  aspect-ratio: 5 / 3;
  background-color: var(--colour-surface-alt);
  border: 1px solid var(--colour-border);
}

.station-map-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

/*
 * Short snippets, so centred (brand rule). A minimum, not a height: on the narrowest phones its content is
 * taller than 5:3, and the box (aspect-ratio keeps content's height as its minimum) grows instead of clipping
 */
.station-map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 100%;
  padding: var(--space-4);
  text-align: center;
}

/* Padding lifts the inline link to a 24px+ target */
.station-map-link {
  display: inline-block;
  padding-block: var(--space-1);
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

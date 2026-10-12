<script setup lang="ts">
import type { StationHighlight } from '~/types/timetable'

const props = defineProps<{
  highlight: StationHighlight
}>()

const descriptionId = useId()

// Portrait 3:4 crops of the landscape original. The widest is 800px tall, under the shortest
// original (851px), so no crop is ever upscaled
const imageWidths = [240, 360, 480, 600]
const imageUrlBuilder = useImage()

const getPortraitImageUrlByWidth = (width: number) =>
  imageUrlBuilder(props.highlight.imageSrc, { width, height: width * 4 / 3, fit: 'cover', format: 'webp' })

const imageSrcset = computed(() => imageWidths
  .map(width => `${getPortraitImageUrlByWidth(width)} ${width}w`)
  .join(', '))
</script>

<template>
  <li class="station-suggestion-card">
    <!-- Decorative: the station name carries the meaning. Sizes match StationSuggestions' grid -->
    <img
      :src="getPortraitImageUrlByWidth(480)"
      :srcset="imageSrcset"
      sizes="(min-width: 48rem) 20rem, 22rem"
      alt=""
      width="600"
      height="800"
      loading="lazy"
      decoding="async"
      class="station-suggestion-card-image"
    >
    <h3 class="station-suggestion-card-title">
      <!-- Stretched over the whole card, so the card is one click and focus target -->
      <a
        :href="highlight.pageHref"
        target="_blank"
        rel="noopener noreferrer"
        class="station-suggestion-card-link"
        :aria-describedby="descriptionId"
      >
        {{ highlight.station.name }} station<span class="visually-hidden"> (opens in a new tab)</span>
      </a>
    </h3>
    <p :id="descriptionId">
      {{ highlight.description }}
    </p>
  </li>
</template>

<style scoped>
/* Layers, inside the card's own stacking context: shadow → content → the link's hit area */
.station-suggestion-card {
  position: relative;
  isolation: isolate;
  padding: var(--space-3) var(--space-3) var(--space-5);
  background-color: var(--colour-surface-alt);
  border-radius: var(--radius-sm);
  transition: translate var(--duration-base) ease-out;
}

/* Hover shadow, faded in by opacity (motion stays on transforms and opacity) */
.station-suggestion-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  box-shadow: 0 8px 25px var(--colour-card-shadow);
  opacity: 0;
  transition: opacity var(--duration-base) ease-out;
}

.station-suggestion-card-image {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.station-suggestion-card-title {
  margin-block: var(--space-3) var(--space-2);
  font-size: var(--font-size-xl);
}

.station-suggestion-card-link {
  text-decoration: none;
}

.station-suggestion-card-link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: var(--radius-sm);
}

/* The focus ring goes round the whole card (the link's hit area), not just the station name */
.station-suggestion-card-link:focus-visible {
  outline: none;
}

.station-suggestion-card-link:focus-visible::after {
  outline: var(--focus-ring-width) solid var(--colour-focus-ring);
  outline-offset: 3px;
}

/* A 2px lift and a soft shadow, like the first-use cards (StationBentoCard). Pointer devices only */
@media (hover: hover) {
  .station-suggestion-card:hover {
    translate: 0 -2px;
  }

  .station-suggestion-card:hover::after {
    opacity: 1;
  }
}
</style>

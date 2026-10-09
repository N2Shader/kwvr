<script setup lang="ts">
import type { Station, StationHighlight } from '~/types/timetable'

const props = defineProps<{
  highlight: StationHighlight
  /** `sizes` for the photo: how wide this card is at each layout (set by StationBento) */
  imageSizes: string
}>()

const emit = defineEmits<{
  'select-station': [station: Station]
}>()

const labelId = useId()
const descriptionId = useId()

// Resized WebP copies of the 1280px original, never wider than it
const imageWidths = [320, 480, 640, 960, 1280]
const imageUrlBuilder = useImage()

const imageSrcset = computed(() => imageWidths
  .map(width => `${imageUrlBuilder(props.highlight.imageSrc, { width, format: 'webp' })} ${width}w`)
  .join(', '))
</script>

<template>
  <li class="station-bento-card">
    <!-- Decorative: the station name carries the meaning. Lazy, so it never competes with the hero -->
    <img
      :src="imageUrlBuilder(highlight.imageSrc, { width: 640, format: 'webp' })"
      :srcset="imageSrcset"
      :sizes="imageSizes"
      alt=""
      :width="highlight.imageWidth"
      :height="highlight.imageHeight"
      loading="lazy"
      decoding="async"
      class="station-bento-card-image"
    >
    <p
      :id="labelId"
      class="station-bento-card-label"
    >
      {{ highlight.label }}
    </p>
    <div class="station-bento-card-content">
      <h3 class="station-bento-card-title">
        <!-- Stretched over the whole card, so the card is one click and focus target -->
        <button
          type="button"
          class="station-bento-card-button"
          :aria-describedby="`${labelId} ${descriptionId}`"
          @click="emit('select-station', highlight.station)"
        >
          <span class="visually-hidden">Next train from </span>{{ highlight.station.name }}
        </button>
      </h3>
      <p
        :id="descriptionId"
        class="station-bento-card-description"
      >
        {{ highlight.description }}
      </p>
    </div>
  </li>
</template>

<style scoped>
/*
 * Layers, inside the card's own stacking context: shadow → photo → scrim → text → button's hit area.
 * The grey fill shows (with white text at 10.8:1) until the photo loads.
 */
.station-bento-card {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4);
  color: var(--colour-text-inverse);
  background-color: var(--colour-surface-inverse);
  border-radius: var(--radius-lg);
  transition: transform var(--duration-base) ease-out;
}

/* Hover shadow, faded in by opacity (motion stays on transforms and opacity) */
.station-bento-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -3;
  border-radius: inherit;
  box-shadow: 0 8px 25px var(--colour-card-shadow);
  opacity: 0;
  transition: opacity var(--duration-base) ease-out;
}

.station-bento-card-image {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

/* Darkest at the bottom, where the text sits: at least 55% black up to 70% of the card's height */
.station-bento-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background-image: linear-gradient(
    to top,
    var(--colour-photo-scrim-strong) 0%,
    var(--colour-photo-scrim) 70%,
    transparent 100%
  );
}

/* On solid burgundy, so it reads over the lightest part of the photo */
.station-bento-card-label {
  align-self: start;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-tight);
  color: var(--colour-primary-contrast);
  background-color: var(--colour-primary);
  border-radius: var(--radius-sm);
}

.station-bento-card-content {
  display: grid;
  gap: var(--space-1);
}

.station-bento-card-title {
  color: inherit;
}

.station-bento-card-button {
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: start;
  background: none;
  border: 0;
  cursor: pointer;
}

.station-bento-card-button::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: var(--radius-lg);
}

/* The focus ring goes round the whole card (the button's hit area), not just the station name */
.station-bento-card-button:focus-visible {
  outline: none;
}

.station-bento-card-button:focus-visible::after {
  outline: var(--focus-ring-width) solid var(--colour-focus-ring);
  outline-offset: 3px;
}

.station-bento-card-description {
  font-size: var(--font-size-sm);
}

/* MagicBento's only effect left with every option off: a 2px lift and a soft shadow. Pointer devices only */
@media (hover: hover) {
  .station-bento-card:hover {
    transform: translateY(-2px);
  }

  .station-bento-card:hover::after {
    opacity: 1;
  }
}
</style>

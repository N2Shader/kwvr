<script setup lang="ts">
import type { Station, StationHighlight } from '~/types/timetable'

/*
 * The layout of Vue Bits' MagicBento (https://vue-bits.dev/components/magic-bento) with every effect
 * off (stars, spotlight, border glow, tilt, magnetism, click ripple), so it's plain CSS, no listeners.
 * The one thing MagicBento keeps with every effect off, a small lift on hover, is in StationBentoCard.
 * Our own addition: the cards' entrance (useStationBentoEntranceMotion, GSAP).
 */
defineProps<{
  highlights: StationHighlight[]
}>()

const emit = defineEmits<{
  'select-station': [station: Station]
}>()

// Each photo's `sizes`, matching the grid below (keep the two in sync): one column, then two from 40rem,
// then from 64rem four columns, with the 3rd and 4th cards two columns wide. The container stops at
// 80rem, so the bento is 76rem wide inside its 2rem gutters (cards about 19rem, wide ones 38rem).
const featuredCardIndexes = [2, 3]
const featuredImageSizes = '(min-width: 80rem) 38rem, (min-width: 40rem) 50vw, 100vw'
const standardImageSizes = '(min-width: 80rem) 19rem, (min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw'

const getImageSizesByIndex = (cardIndex: number) =>
  featuredCardIndexes.includes(cardIndex) ? featuredImageSizes : standardImageSizes

const stationBento = useTemplateRef<HTMLElement>('stationBento')
const { isBentoEntrancePending } = useStationBentoEntranceMotion(stationBento)
</script>

<template>
  <ul
    ref="stationBento"
    :class="['station-bento', { 'station-bento-entrance-pending': isBentoEntrancePending }]"
  >
    <StationBentoCard
      v-for="(highlight, cardIndex) in highlights"
      :key="highlight.station.id"
      :highlight="highlight"
      :image-sizes="getImageSizesByIndex(cardIndex)"
      @select-station="emit('select-station', $event)"
    />
  </ul>
</template>

<style scoped>
.station-bento {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-3);
  padding: 0;
  list-style: none;
}

/*
 * Anti-flash guard for the entrance: the server-rendered cards stay hidden until the motion has hidden
 * them itself, so they don't show, vanish on hydration, then fly in. If the script never runs, they
 * appear after 2s anyway, so the content is never blocked for good. Only when motion is welcome; the
 * cards are simply there otherwise.
 */
@media (prefers-reduced-motion: no-preference) {
  .station-bento-entrance-pending > * {
    opacity: 0;
    animation: station-bento-card-reveal 0s 2s forwards;
  }
}

@keyframes station-bento-card-reveal {
  to {
    opacity: 1;
  }
}

/* Below the four-column layout every card keeps MagicBento's 4:3 shape */
.station-bento > * {
  aspect-ratio: 4 / 3;
  min-height: 12.5rem;
}

@media (min-width: 40rem) {
  .station-bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/*
 * MagicBento's bento: four columns, three rows of equal height.
 *   1 2 3 3
 *   4 4 3 3
 *   4 4 5 6
 * The rows set the height, so every card stretches to its area instead of keeping 4:3.
 */
@media (min-width: 64rem) {
  .station-bento {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(3, minmax(12.5rem, auto));
  }

  .station-bento > * {
    aspect-ratio: auto;
  }

  .station-bento > :nth-child(3) {
    grid-column: span 2;
    grid-row: span 2;
  }

  .station-bento > :nth-child(4) {
    grid-column: 1 / span 2;
    grid-row: 2 / span 2;
  }

  .station-bento > :nth-child(6) {
    grid-column: 4;
    grid-row: 3;
  }
}
</style>

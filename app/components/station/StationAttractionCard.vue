<script setup lang="ts">
import type { StationAttraction } from '~/types/timetable'

defineProps<{
  attraction: StationAttraction
}>()
</script>

<template>
  <div class="attraction-card">
    <!-- Decorative: the heading carries the meaning -->
    <img
      :src="attraction.imageSrc"
      alt=""
      width="300"
      height="400"
      loading="lazy"
      class="attraction-image"
    >
    <h3 class="attraction-title">
      {{ attraction.title }}
    </h3>
    <p>{{ attraction.description }}</p>
  </div>
</template>

<style scoped>
.attraction-card {
  height: 100%;
  padding: var(--space-3) var(--space-3) var(--space-5);
  background-color: var(--colour-surface-alt);
  border-radius: var(--radius-sm);
}

.attraction-image {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  background-color: var(--colour-surface-alt);
  border-radius: var(--radius-sm);
}

.attraction-title {
  margin-block: var(--space-3) var(--space-2);
  font-size: var(--font-size-xl);
}
</style>

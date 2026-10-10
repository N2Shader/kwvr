<script setup lang="ts">
import type { TrainServiceNote } from '~/types/timetable'

// Timetable symbols with what they mean: the Key under the results and a journey's "About this journey".
// The default slot adds more `<li>` lines after the symbols (e.g. the request stop's wording).
defineProps<{
  notes: TrainServiceNote[]
}>()
</script>

<template>
  <ul class="note-list">
    <li
      v-for="note in notes"
      :key="note.code"
      class="note-list-item"
    >
      <!-- Decorative here: the description next to it says what it means -->
      <img
        :src="note.iconSrc"
        alt=""
        width="24"
        height="24"
        class="note-list-icon"
      >
      <span>{{ note.description }}</span>
    </li>
    <slot />
  </ul>
</template>

<style scoped>
.note-list {
  display: grid;
  gap: var(--space-3);
  padding: 0;
  margin: 0;
  list-style: none;
}

/* :slotted() too, so the parent's extra lines line up with the symbols */
.note-list-item,
:slotted(li) {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.note-list-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
}
</style>

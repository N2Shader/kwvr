<script setup lang="ts">
import type { TrainService } from '~/types/timetable'

const props = defineProps<{
  services: TrainService[]
}>()

// Only the symbols these results use, each once, in the order they first appear
const keyNotes = computed(() => [
  ...new Map(props.services.flatMap(service => service.notes).map(note => [note.code, note])).values(),
])

const headingId = useId()
</script>

<template>
  <section
    v-if="keyNotes.length > 0"
    class="results-key container"
    :aria-labelledby="headingId"
  >
    <h3
      :id="headingId"
      class="results-key-heading"
    >
      Key
    </h3>
    <TimetableNoteList :notes="keyNotes" />
  </section>
</template>

<style scoped>
/* The results above end with their own padding, so only the bottom needs it */
.results-key {
  padding-bottom: var(--space-6);
}

.results-key-heading {
  margin-bottom: var(--space-3);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}
</style>

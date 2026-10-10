<script setup lang="ts">
import type { TimetableSearchCriteria } from '~/types/timetable'

defineProps<{
  criteria: TimetableSearchCriteria
}>()

const headingId = useId()
</script>

<template>
  <UContainer
    as="section"
    class="loading-state"
    aria-busy="true"
    :aria-labelledby="headingId"
  >
    <!-- The same heading as the results, so the page's headings don't change when they arrive -->
    <h2
      :id="headingId"
      class="visually-hidden"
    >
      Departures
    </h2>
    <!-- For screen readers reading the page; the page's live region announces the search as it starts -->
    <p class="visually-hidden">
      Loading departures…
    </p>
    <!-- Real text, not a placeholder: the search's day is known, and the table stays put when results arrive -->
    <TimetableResultsDayHint :departing-after="criteria.departingAfter" />
    <TimetableResultsSkeleton />
    <TimetableResultsKeySkeleton class="loading-state-key" />
  </UContainer>
</template>

<style scoped>
/*
 * Same spacing as the results (TimetableResults) and their Key (TimetableResultsKey), so nothing moves
 * when they arrive: the section's top padding is the results', the Key's gap is the results' bottom
 * padding, and the section's bottom padding is the Key's.
 */
.loading-state {
  padding-block: var(--space-6);
}

.loading-state-key {
  margin-top: var(--space-6);
}
</style>

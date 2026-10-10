<script setup lang="ts">
const headingId = useId()
</script>

<template>
  <section
    class="loading-state container"
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
    <TimetableResultsSkeleton />
  </section>
</template>

<style scoped>
/* Same spacing as the results (TimetableResults), so nothing moves when they arrive */
.loading-state {
  padding-block: var(--space-6);
}
</style>

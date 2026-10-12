<script setup lang="ts">
// The search worked but no train runs then (not running that day, or none left after that time):
// an empty platform under the station clock, what to try, and a way back to the station cards
const emit = defineEmits<{
  'return-home': []
}>()
</script>

<template>
  <TimetableIllustratedState
    class="no-results-state"
    heading="Sorry, there are no trains at that time"
    message="No trains leave that station on the day and at the time you chose. We don’t run every day, so please try another date or an earlier time."
    illustration-src="/images/station-clock.webp"
    :illustration-width="960"
    :illustration-height="640"
    illustration-sizes="(min-width: 40rem) 30rem, 20rem"
    @return-home="emit('return-home')"
  />
</template>

<style scoped>
/* Landscape art: wider than the error state's portrait one, for about the same height */
.no-results-state {
  --illustrated-state-image-max-width: 20rem;
}

@media (min-width: 40rem) {
  .no-results-state {
    --illustrated-state-image-max-width: 30rem;
  }
}
</style>

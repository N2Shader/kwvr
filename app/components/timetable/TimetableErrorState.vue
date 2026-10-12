<script setup lang="ts">
// The search failed: a derailed train, what happened, and a way back to the station cards
const emit = defineEmits<{
  'return-home': []
}>()
</script>

<template>
  <TimetableIllustratedState
    class="error-state"
    heading="Sorry, we couldn’t load the timetable"
    message="Something went wrong on our side while finding train times. Please try again in a moment."
    illustration-src="/images/derailed-train.webp"
    :illustration-width="960"
    :illustration-height="1056"
    illustration-sizes="(min-width: 40rem) 20rem, 16rem"
    @return-home="emit('return-home')"
  />
</template>

<style scoped>
/* Portrait art: kept narrow, so it isn't too tall */
.error-state {
  --illustrated-state-image-max-width: 16rem;
}

@media (min-width: 40rem) {
  .error-state {
    --illustrated-state-image-max-width: 20rem;
  }
}
</style>

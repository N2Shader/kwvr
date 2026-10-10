<script setup lang="ts">
defineProps<{
  stationName: string
  /** Local ISO date-time without offset, e.g. `2026-04-24T12:20` */
  dateTime: string
}>()
</script>

<!-- A result's origin or destination cell: the station, then its departure or arrival time -->
<template>
  <span class="result-station">{{ stationName }}</span>
  <time
    :datetime="dateTime"
    class="result-time"
  >{{ formatClockTime(dateTime) }}</time>
</template>

<style scoped>
.result-station,
.result-time {
  display: block;
}

.result-station {
  font-size: var(--font-size-lg);
}
</style>

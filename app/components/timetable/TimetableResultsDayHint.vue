<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import { getLocalTimeZone, today } from '@internationalized/date'

const props = defineProps<{
  /** The search's date-time, e.g. `2026-10-09T14:30` */
  departingAfter: string
}>()

// Read from the user's clock once mounted, never during SSR (the server's day and time zone differ)
const todayDate = shallowRef<CalendarDate>()
onMounted(() => {
  todayDate.value = today(getLocalTimeZone())
})

const isSearchForAnotherDay = computed(() =>
  todayDate.value !== undefined && !isDepartingAfterOnDate(props.departingAfter, todayDate.value))
</script>

<template>
  <p
    v-if="isSearchForAnotherDay"
    class="results-day-hint"
  >
    <!-- The asterisk is decoration: screen readers would read it out as "star" -->
    <span aria-hidden="true">* </span>These trains are not for today
  </p>
</template>

<style scoped>
.results-day-hint {
  margin-block-end: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--colour-text);
}
</style>

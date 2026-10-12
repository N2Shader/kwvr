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
  <!--
    The line is always there, empty for today: the hint can only be known once mounted (the user's clock),
    so it would otherwise push the table (or a shared link's skeleton) down when it appears
  -->
  <div class="results-day-hint-line">
    <p
      v-if="isSearchForAnotherDay"
      class="results-day-hint"
    >
      <!-- The asterisk is decoration: screen readers would read it out as "star" -->
      <span aria-hidden="true">* </span>These trains are not for today
    </p>
  </div>
</template>

<style scoped>
/* One line of the hint's text, whether it shows or not */
.results-day-hint-line {
  min-height: calc(var(--font-size-xs) * var(--line-height-base));
  margin-block-end: var(--space-3);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-base);
}

.results-day-hint {
  color: var(--colour-text);
}
</style>

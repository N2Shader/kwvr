<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'

defineProps<{
  /** Days before this can't be picked */
  earliestDate?: CalendarDate
}>()

const selectedDate = defineModel<CalendarDate>()

const appConfig = useAppConfig()
const dateFieldId = useId()
const dateLabelId = useId()
const dateValueId = useId()
const isCalendarOpen = ref(false)

const selectedDateText = computed(() => selectedDate.value ? formatShortDate(selectedDate.value) : 'Select a date')

// Picking a day closes the calendar; the popover then returns focus to the trigger
const closeCalendar = () => {
  isCalendarOpen.value = false
}
</script>

<template>
  <!--
    The field styles (.search-field, .search-field-control) come from TimetableSearchForm:
    this root element carries the form's scope attribute too, so its scoped rules apply here.
  -->
  <label
    :for="dateFieldId"
    class="search-field"
  >
    <span
      :id="dateLabelId"
      class="search-field-label"
    >Date</span>
    <UPopover
      v-model:open="isCalendarOpen"
      :content="{ align: 'start' }"
      :ui="{ content: 'search-date-popover' }"
    >
      <!-- Opens a dialog (aria-haspopup, aria-expanded and aria-controls come from the popover) -->
      <button
        :id="dateFieldId"
        type="button"
        class="search-field-control search-date-trigger"
        :aria-labelledby="`${dateLabelId} ${dateValueId}`"
      >
        <span :id="dateValueId">{{ selectedDateText }}</span>
        <UIcon
          :name="appConfig.ui.icons.chevronDown"
          class="search-date-chevron"
          aria-hidden="true"
        />
      </button>

      <template #content>
        <UCalendar
          v-model="selectedDate"
          :min-value="earliestDate"
          locale="en-GB"
          size="lg"
          :year-controls="false"
          prevent-deselect
          initial-focus
          class="search-date-calendar"
          @update:model-value="closeCalendar"
        />
      </template>
    </UPopover>
    <input
      type="hidden"
      name="departingDate"
      :value="selectedDate?.toString()"
    >
  </label>
</template>

<style scoped>
.search-date-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
  /*
   * The date never wraps, so the field keeps the same height as the others. The minimum width fits the
   * longest date ("Wed, 30 Sep 2026", 16 characters) plus padding and chevron, so the row doesn't shift
   * when a shorter date is picked.
   */
  min-inline-size: calc(16ch + 2 * var(--space-3) + var(--space-2) + 1.25rem);
  white-space: nowrap;
  cursor: pointer;
}

/* Matches the Select's chevron: same size, same flip while open */
.search-date-chevron {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  transition: transform var(--duration-fast) ease;
}

.search-date-trigger[aria-expanded='true'] .search-date-chevron {
  transform: rotate(180deg);
}
</style>

<!-- Not scoped: the calendar is portalled to <body>, out of reach of scoped CSS. Unlayered, so it beats Nuxt UI. -->
<style>
.search-date-popover {
  padding: var(--space-3);
  color: var(--colour-text);
  /* Box-shadow rings vanish in forced-colours mode; a transparent border keeps the edge */
  border: 1px solid transparent;
}

/* Past days: softer colour plus a strike-through, so "unavailable" isn't shown by colour alone */
.search-date-calendar [data-slot='cellTrigger'][data-disabled] {
  color: var(--colour-text-disabled);
  text-decoration: line-through;
  background-color: transparent;
  cursor: not-allowed;
}
</style>

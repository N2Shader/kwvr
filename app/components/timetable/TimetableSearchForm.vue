<script setup lang="ts">
import { getLocalTimeZone, toCalendarDate, today } from '@internationalized/date'
import type { CalendarDate, Time } from '@internationalized/date'
import type { Station, TimetableSearchCriteria, TimetableSearchDefaults, TimetableSearchFormErrors, TimetableSearchFormValues } from '~/types/timetable'

const props = defineProps<{
  stations: Station[]
  defaultCriteria: TimetableSearchDefaults
}>()

// A search that passes the checks goes out as criteria; the page runs it (see useTimetableSearch)
const emit = defineEmits<{
  search: [criteria: TimetableSearchCriteria]
}>()

const legendId = useId()
const searchForm = useTemplateRef<HTMLFormElement>('searchForm')

// The fields' values, until a search sends them
const selectedOriginId = ref(props.defaultCriteria.origin?.id)
const earliestDepartingDate = ref<CalendarDate>()
const selectedDepartingDate = ref<CalendarDate>()
const selectedDepartingTime = ref<Time>()

const {
  departureClock,
  departingTimeNotice,
  earliestDepartingTime,
  refreshDepartureClock,
  commitDepartingTime,
  pauseDepartingTimeCommit,
  resumeDepartingTimeCommit,
} = useDepartureTimeLimit(selectedDepartingDate, selectedDepartingTime)

// The date and time prefill read the user's own clock, so they're set on the client only
// (on the server they would use the server's clock and time zone, and mismatch on hydration).
// The prefill and the time limit read the same instant.
const applyDepartureDefaults = () => {
  refreshDepartureClock()
  const departureDefaults = getDepartureDefaultsByClock(departureClock.value)
  earliestDepartingDate.value = departureDefaults.earliestDate
  selectedDepartingDate.value = departureDefaults.date
  selectedDepartingTime.value = departureDefaults.time
}

onMounted(applyDepartureDefaults)

const searchFormValues = computed<TimetableSearchFormValues>(() => ({
  originId: selectedOriginId.value,
  departingDate: selectedDepartingDate.value,
  departingTime: selectedDepartingTime.value,
}))

// Errors show only once a search has been tried; after that they update as each field is fixed
const hasTriedSearch = ref(false)
const searchFormErrors = computed<TimetableSearchFormErrors>(() => {
  if (!hasTriedSearch.value) return {}
  const todayDate = departureClock.value ? toCalendarDate(departureClock.value) : today(getLocalTimeZone())
  return getSearchFormErrorsByValues(searchFormValues.value, { todayDate, earliestTime: earliestDepartingTime.value })
})

// Focus goes to the first field to fix, whose control reads its error out (aria-describedby)
const focusFirstInvalidField = () => {
  searchForm.value
    ?.querySelector('.search-field-invalid')
    ?.querySelector<HTMLElement>('button, [role="spinbutton"]')
    ?.focus()
}

// Enter in the time field and the Search button both end up here, through the form's submit event.
// The Search button is never disabled: it stays focusable, and pressing it explains what's missing.
// A time already gone today is refused, not fixed: the user sees an error and chooses again.
const submitSearch = async () => {
  // Moving focus to a field to fix mustn't quietly fix the time on the way out of the time field
  pauseDepartingTimeCommit()
  // Time may have passed since the field was filled in, so check against the clock again
  refreshDepartureClock()
  hasTriedSearch.value = true

  if (Object.keys(searchFormErrors.value).length > 0) {
    await nextTick()
    focusFirstInvalidField()
    resumeDepartingTimeCommit()
    return
  }

  resumeDepartingTimeCommit()
  hasTriedSearch.value = false

  const searchCriteria = getSearchCriteriaByFormValues(searchFormValues.value, props.stations)
  if (searchCriteria) emit('search', searchCriteria)
}

// A station card under the search box: fill in that station, put the date and time back to the next
// departure (the same rule as the prefill), and submit, so the form shows what was searched.
// It goes through the same checks and the same `search` event as the Search button.
const searchNextTrainFromStation = (station: Station) => {
  selectedOriginId.value = station.id
  applyDepartureDefaults()
  searchForm.value?.requestSubmit()
}

defineExpose({ searchNextTrainFromStation })
</script>

<template>
  <form
    ref="searchForm"
    role="search"
    class="search-form"
    :aria-labelledby="legendId"
    @submit.prevent="submitSearch"
  >
    <fieldset class="search-form-fieldset">
      <legend
        :id="legendId"
        class="visually-hidden"
      >
        Search train times
      </legend>

      <TimetableOriginSelect
        v-model="selectedOriginId"
        :stations="stations"
        :error-message="searchFormErrors.originId"
      />

      <TimetableDepartureDatePicker
        v-model="selectedDepartingDate"
        :earliest-date="earliestDepartingDate"
        :error-message="searchFormErrors.departingDate"
      />

      <TimetableDepartureTimeField
        v-model="selectedDepartingTime"
        :earliest-time="earliestDepartingTime"
        :notice="departingTimeNotice"
        :error-message="searchFormErrors.departingTime"
        @edit="resumeDepartingTimeCommit"
        @commit="commitDepartingTime"
        @search="searchForm?.requestSubmit()"
      />

      <UButton
        type="submit"
        label="Search"
        class="button-primary search-form-submit"
        @pointerdown="pauseDepartingTimeCommit"
      />
    </fieldset>
  </form>
</template>

<style scoped>
.search-form-fieldset {
  display: grid;
  gap: var(--space-3);
  padding: 0;
  border: 0;
}

.search-field {
  display: grid;
  gap: var(--space-1);
}

/*
 * :deep() because the origin, date and time fields are child components (and UButton renders through a
 * multi-root component), so their inner elements don't receive this component's scope attribute.
 * `font: inherit` and `text-align: start` cancel the <button> text styles of the Select and date triggers.
 */
.search-field :deep(.search-field-label) {
  font-size: var(--font-size-sm);
}

.search-field :deep(.search-field-control) {
  min-height: 2.75rem;
  padding: var(--space-2) var(--space-3);
  font: inherit;
  color: var(--colour-text);
  text-align: start;
  background-color: var(--colour-surface);
  border: 1px solid var(--colour-border);
  border-radius: var(--radius-sm);
}

/* Hug the field: the 2px focus ring sits over the 1px border, so the field reads as burgundy-edged */
.search-field :deep(.search-field-control:focus-visible) {
  outline-offset: -1px;
}

/* A field to fix gets a red edge, alongside its written error (so it isn't shown by colour alone) */
.search-field-invalid :deep(.search-field-control) {
  border-color: var(--colour-border-error);
}

.search-form-fieldset :deep(.search-form-submit) {
  justify-self: center;
}

/*
 * Desktop: one row, with the button lined up against the controls.
 * From 48rem the hero card is wide enough for all four on a single line; below that they stack.
 * Three shared rows (label, control, error), so an error under one field never pushes its control
 * out of line with the others.
 */
@media (min-width: 48rem) {
  .search-form-fieldset {
    /* The station takes the spare space; date, time and the button take what their content needs */
    grid-template-columns: minmax(0, 1fr) auto auto auto;
    grid-template-rows: auto auto auto;
    column-gap: var(--space-4);
    row-gap: var(--space-1);
  }

  .search-field {
    grid-row: 1 / span 3;
    grid-template-rows: subgrid;
  }

  .search-field :deep(.search-field-error) {
    grid-row: 3;
  }

  .search-form-fieldset :deep(.search-form-submit) {
    grid-row: 2;
    align-self: end;
  }
}
</style>


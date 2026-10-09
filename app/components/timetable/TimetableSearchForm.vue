<script setup lang="ts">
import type { CalendarDate, Time } from '@internationalized/date'
import type { Station, TimetableSearchDefaults } from '~/types/timetable'

const props = defineProps<{
  stations: Station[]
  defaultCriteria: TimetableSearchDefaults
}>()

const legendId = useId()
const originFieldId = useId()
const originLabelId = useId()
const departingTimeFieldId = useId()
const departingTimeLabelId = useId()

// Local state only — searching is wired up once the API is available
const selectedOriginId = ref(props.defaultCriteria.origin?.id)
const earliestDepartingDate = ref<CalendarDate>()
const selectedDepartingDate = ref<CalendarDate>()
const selectedDepartingTime = ref<Time>()

// The date and time prefill read the user's own clock, so they're set on the client only
// (on the server they would use the server's clock and time zone, and mismatch on hydration)
onMounted(() => {
  const departureDefaults = getDepartureDefaultsByClock()
  earliestDepartingDate.value = departureDefaults.earliestDate
  selectedDepartingDate.value = departureDefaults.date
  selectedDepartingTime.value = departureDefaults.time
})
</script>

<template>
  <form
    role="search"
    class="search-form"
    :aria-labelledby="legendId"
    @submit.prevent
  >
    <fieldset class="search-form-fieldset">
      <legend
        :id="legendId"
        class="visually-hidden"
      >
        Search train times
      </legend>

      <label
        :for="originFieldId"
        class="search-field"
      >
        <span
          :id="originLabelId"
          class="search-field-label"
        >Departing from</span>
        <!--
          The trigger is a role="combobox" <button>; aria-labelledby names it reliably in every browser.
          The placeholder shows in the trigger only — it is never an option in the listbox.
        -->
        <USelect
          :id="originFieldId"
          v-model="selectedOriginId"
          :items="stations"
          value-key="id"
          label-key="name"
          name="origin"
          placeholder="Select a station"
          variant="none"
          :aria-labelledby="originLabelId"
          :ui="{ trailing: 'search-origin-trailing', trailingIcon: 'search-origin-chevron', content: 'search-origin-menu', item: 'search-origin-option' }"
          class="search-field-control search-origin-trigger"
        />
      </label>

      <TimetableDepartureDatePicker
        v-model="selectedDepartingDate"
        :earliest-date="earliestDepartingDate"
      />

      <label
        :for="departingTimeFieldId"
        class="search-field"
      >
        <span
          :id="departingTimeLabelId"
          class="search-field-label"
        >Time</span>
        <!-- A group of hour and minute spinbuttons; the label's `for` reaches its hidden input, which forwards focus -->
        <UInputTime
          :id="departingTimeFieldId"
          v-model="selectedDepartingTime"
          name="departingTime"
          variant="none"
          locale="en-GB"
          :hour-cycle="24"
          :aria-labelledby="departingTimeLabelId"
          class="search-field-control search-time-field"
        />
      </label>

      <UButton
        type="submit"
        label="Search"
        class="button-primary search-form-submit"
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
 * :deep() because USelect, UInputTime and UButton render through multi-root components, and the
 * date picker is a child component, so their inner elements don't receive this component's scope attribute.
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

/* The chevron is absolutely positioned, so keep the value text clear of it (1.25rem = chevron size) */
.search-field :deep(.search-origin-trigger) {
  padding-inline-end: calc(var(--space-3) + 1.25rem + var(--space-2));
}

.search-field :deep(.search-origin-trailing) {
  padding-inline-end: var(--space-3);
}

/* The chevron flips while the menu is open, keyed off the same ARIA state screen readers hear */
.search-field :deep(.search-origin-chevron) {
  transition: transform var(--duration-fast) ease;
}

.search-field :deep(.search-origin-trigger[aria-expanded='true'] .search-origin-chevron) {
  transform: rotate(180deg);
}

/* Time: the hour and minute segments take focus, so the whole field shows the ring */
.search-field :deep(.search-time-field:focus-within) {
  outline: var(--focus-ring-width) solid var(--colour-focus-ring);
  outline-offset: -1px;
}

/* The focused segment is filled, like a native time input, so it's clear which part is changing */
.search-field :deep(.search-time-field [data-slot='segment']:focus-visible) {
  outline: none;
  color: var(--colour-primary-contrast);
  background-color: var(--colour-primary);
}

.search-form-fieldset :deep(.search-form-submit) {
  justify-self: center;
}

/*
 * Desktop: one row, with the button lined up against the controls.
 * From 48rem the hero card is wide enough for all four on a single line; below that they stack.
 */
@media (min-width: 48rem) {
  .search-form-fieldset {
    /* The station takes the spare space; date, time and the button take what their content needs */
    grid-template-columns: minmax(0, 1fr) auto auto auto;
    align-items: end;
    gap: var(--space-4);
  }
}
</style>

<!--
  Not scoped: the origin menu is portalled to <body>, out of reach of scoped CSS.
  Unlayered, so it beats Nuxt UI's text-sm and max-h. The menu's ring uses the soft border token via --ui-border.
-->
<style>
.search-origin-menu {
  /* Fit every station; scroll only when the viewport is genuinely too short (e.g. a landscape phone) */
  max-height: var(--reka-select-content-available-height);
  color: var(--colour-text);
  /* Box-shadow rings vanish in forced-colours mode; a transparent border keeps the menu's edge */
  border: 1px solid transparent;
}

.search-origin-option {
  font: inherit;
  font-size: var(--font-size-base);
  color: var(--colour-text);
}

/* Burgundy tick marks the selected station */
.search-origin-option [data-slot='itemTrailingIcon'] {
  color: var(--colour-text-accent);
}
</style>

<script setup lang="ts">
import type { Time } from '@internationalized/date'

defineProps<{
  /** Times before this show as invalid until they're committed (and moved up to it) */
  earliestTime?: Time
  /** Polite announcement, e.g. when the time was moved to the earliest departure */
  notice: string
  /** Shown under the field after a search that can't run without a full time */
  errorMessage?: string
}>()

const emit = defineEmits<{
  /** Focus came into the field from outside it */
  edit: []
  /** Focus left the field: the user is done editing the time (relatedTarget says where focus went) */
  commit: [focusEvent: FocusEvent]
  /** Enter was pressed in the field */
  search: []
}>()

const selectedTime = defineModel<Time>()

const timeFieldId = useId()
const timeLabelId = useId()
const timeErrorId = useId()
</script>

<template>
  <!--
    The field styles (.search-field, .search-field-control) come from TimetableSearchForm:
    this root element carries the form's scope attribute too, so its scoped rules apply here.
  -->
  <label
    :for="timeFieldId"
    class="search-field"
    :class="{ 'search-field-invalid': errorMessage }"
  >
    <span
      :id="timeLabelId"
      class="search-field-label"
    >Time</span>
    <!--
      A group of hour and minute spinbuttons; the label's `for` reaches its hidden input, which forwards focus.
      The segments swallow every keydown (Enter included), so the browser never submits the form on its own;
      the keydown still bubbles up to the group, where Enter asks the form to submit.
    -->
    <UInputTime
      :id="timeFieldId"
      v-model="selectedTime"
      name="departingTime"
      variant="none"
      locale="en-GB"
      :hour-cycle="24"
      :min-value="earliestTime"
      :aria-labelledby="timeLabelId"
      :aria-describedby="errorMessage ? timeErrorId : undefined"
      class="search-field-control search-time-field"
      @focus="emit('edit')"
      @blur="(focusEvent: FocusEvent) => emit('commit', focusEvent)"
      @keydown.enter="emit('search')"
    />
    <TimetableSearchFieldError
      v-if="errorMessage"
      :id="timeErrorId"
      :message="errorMessage"
    />
    <span
      class="visually-hidden"
      aria-live="polite"
    >{{ notice }}</span>
  </label>
</template>

<style scoped>
/* Time: the hour and minute segments take focus, so the whole field shows the ring */
.search-field :deep(.search-time-field:focus-within) {
  outline: var(--focus-ring-width) solid var(--colour-focus-ring);
  outline-offset: -1px;
}

/* A time already gone today: struck through like the calendar's past days, so it isn't shown by colour alone */
.search-field :deep(.search-time-field[data-invalid] [data-slot='segment']) {
  color: var(--colour-text-disabled);
  text-decoration: line-through;
}

/* The focused segment is filled, like a native time input, so it's clear which part is changing (kept after the invalid rule so it wins) */
.search-field :deep(.search-time-field [data-slot='segment']:focus-visible) {
  outline: none;
  color: var(--colour-primary-contrast);
  background-color: var(--colour-primary);
}
</style>

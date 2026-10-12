<script setup lang="ts">
import type { Station } from '~/types/timetable'

defineProps<{
  stations: Station[]
  /** Shown under the field after a search that can't run without it */
  errorMessage?: string
}>()

const selectedOriginId = defineModel<string>()

const originFieldId = useId()
const originLabelId = useId()
const originErrorId = useId()
</script>

<template>
  <!--
    The field styles (.search-field, .search-field-control) come from TimetableSearchForm:
    this root element carries the form's scope attribute too, so its scoped rules apply here.
  -->
  <label
    :for="originFieldId"
    class="search-field"
    :class="{ 'search-field-invalid': errorMessage }"
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
      :aria-describedby="errorMessage ? originErrorId : undefined"
      :aria-invalid="errorMessage ? 'true' : undefined"
      :ui="{ trailing: 'search-origin-trailing', trailingIcon: 'search-origin-chevron', content: 'search-origin-menu', item: 'search-origin-option' }"
      class="search-field-control search-origin-trigger"
    />
    <TimetableSearchFieldError
      v-if="errorMessage"
      :id="originErrorId"
      :message="errorMessage"
    />
  </label>
</template>

<style scoped>
/* :deep() because USelect renders through a multi-root component, so its trigger doesn't receive the scope attribute */

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

/* No colour transitions: the highlight follows the arrow keys at once */
.search-origin-option,
.search-origin-option::before {
  transition: none;
}

/*
 * No ring on the options: the highlighted option's pill (below) is their focus indicator.
 * reka moves focus to an option in script, and the trigger blocks focus on mousedown, so after a load
 * Chrome counts that first mouse-opened focus as keyboard focus (:focus-visible), and our global ring
 * drew a square box round the option.
 */
.search-origin-option:focus-visible {
  outline: none;
}

/*
 * The highlighted option (pointer or arrow keys) is a solid burgundy pill with white text (~7.6:1),
 * in Nuxt UI's inset rounded shape (its ::before). Its own highlight, cream at 50% on white, was too faint.
 */
.search-origin-option[data-highlighted] {
  color: var(--colour-primary-contrast);
}

.search-origin-option[data-highlighted]::before {
  background-color: var(--colour-primary);
}

/* Burgundy tick marks the selected station; white on the pill, so it stays visible there */
.search-origin-option [data-slot='itemTrailingIcon'] {
  color: var(--colour-text-accent);
}

.search-origin-option[data-highlighted] [data-slot='itemTrailingIcon'] {
  color: var(--colour-primary-contrast);
}

/* Forced colours drop backgrounds, so the highlighted option gets an outline instead */
@media (forced-colors: active) {
  .search-origin-option[data-highlighted] {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}
</style>

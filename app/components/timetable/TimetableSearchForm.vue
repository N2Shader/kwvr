<script setup lang="ts">
import type { Station, TimetableSearchCriteria } from '~/types/timetable'

const props = defineProps<{
  stations: Station[]
  defaultCriteria: TimetableSearchCriteria
}>()

const legendId = useId()
const originFieldId = useId()
const departingAfterFieldId = useId()

// Local state only — searching is wired up once the API is available
const selectedOriginId = ref(props.defaultCriteria.origin.id)
const selectedDepartingAfter = ref(props.defaultCriteria.departingAfter)
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
        <span class="search-field-label">Departing from</span>
        <select
          :id="originFieldId"
          v-model="selectedOriginId"
          name="origin"
          class="search-field-control"
        >
          <option
            v-for="station in stations"
            :key="station.id"
            :value="station.id"
          >
            {{ station.name }}
          </option>
        </select>
      </label>

      <label
        :for="departingAfterFieldId"
        class="search-field"
      >
        <span class="search-field-label">Date and time</span>
        <input
          :id="departingAfterFieldId"
          v-model="selectedDepartingAfter"
          type="datetime-local"
          name="departingAfter"
          class="search-field-control"
        >
      </label>

      <button
        type="submit"
        class="button-primary search-form-submit"
      >
        Search
      </button>
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

.search-field-label {
  font-size: var(--font-size-sm);
}

.search-field-control {
  min-height: 2.75rem;
  padding: var(--space-2) var(--space-3);
  color: var(--colour-text);
  background-color: var(--colour-surface);
  border: 1px solid var(--colour-border);
  border-radius: var(--radius-sm);
}

.search-form-submit {
  justify-self: center;
}

/* Desktop: one row, with the button lined up against the controls */
@media (min-width: 40rem) {
  .search-form-fieldset {
    grid-template-columns: 1fr 1fr auto;
    align-items: end;
    gap: var(--space-4);
  }
}
</style>

<script setup lang="ts">
import type { TimetableSearchCriteria, TrainService } from '~/types/timetable'

const props = defineProps<{
  services: TrainService[]
  searchCriteria: TimetableSearchCriteria
}>()

const captionText = computed(() => {
  const { origin, departingAfter } = props.searchCriteria
  return `Departures from ${origin.name} after ${formatClockTime(departingAfter)} on ${formatLongDate(departingAfter)}`
})
</script>

<template>
  <section class="timetable-results container">
    <h2 class="visually-hidden">
      Departures
    </h2>
    <!--
      Explicit table roles are deliberate: the mobile layout changes `display` on table parts,
      which makes some browsers drop the implicit table semantics.
    -->
    <!-- eslint-disable vuejs-accessibility/no-redundant-roles -->
    <table
      role="table"
      class="results-table"
    >
      <caption class="visually-hidden">
        {{ captionText }}
      </caption>
      <thead role="rowgroup">
        <tr
          role="row"
          class="results-head-row"
        >
          <th
            role="columnheader"
            scope="col"
            class="column-origin"
          >
            Origin
          </th>
          <th
            role="columnheader"
            scope="col"
            class="column-info"
          >
            Info
          </th>
          <th
            role="columnheader"
            scope="col"
            class="column-destination"
          >
            Destination
          </th>
        </tr>
      </thead>
      <tbody
        role="rowgroup"
        class="results-body"
      >
        <TimetableResultRow
          v-for="service in services"
          :key="service.id"
          :service="service"
        />
      </tbody>
    </table>
    <!-- eslint-enable vuejs-accessibility/no-redundant-roles -->
  </section>
</template>

<style scoped>
.timetable-results {
  padding-block: var(--space-6);
}

/* Desktop: vertical border-spacing turns each row into a separate card */
.results-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 var(--space-4);
}

.results-head-row th {
  padding: 0 var(--space-4);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.column-origin {
  width: 30%;
  text-align: start;
}

.column-info {
  text-align: center;
}

.column-destination {
  width: 30%;
  text-align: end;
}

/* Mobile: rows become two-row grids (origin + destination, then info) */
@media (max-width: 39.99rem) {
  .results-table,
  .results-table thead,
  .results-body {
    display: block;
  }

  .results-body {
    display: grid;
    gap: var(--space-4);
    margin-top: var(--space-3);
  }

  .results-head-row {
    display: flex;
    justify-content: space-between;
  }

  .column-origin,
  .column-destination {
    width: auto;
  }

  /* Same as .visually-hidden, only on mobile */
  .column-info {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
</style>

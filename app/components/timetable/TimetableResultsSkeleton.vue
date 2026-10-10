<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

// Every placeholder row draws the same shapes, so a row only needs a key
interface ResultsSkeletonRow {
  id: string
}

// As many rows as the placeholder results, so the page barely moves when they arrive
const skeletonRows: ResultsSkeletonRow[] = Array.from({ length: 5 }, (_, rowIndex) => ({ id: `skeleton-row-${rowIndex + 1}` }))

// Display-only columns (no data behind them), with the results table's headers and classes
const skeletonColumns: TableColumn<ResultsSkeletonRow>[] = [
  { id: 'origin', header: 'Origin', meta: { class: { th: 'column-origin', td: 'timetable-table-cell departure-origin' } } },
  { id: 'info', header: 'Info', meta: { class: { th: 'column-info', td: 'timetable-table-cell departure-info' } } },
  { id: 'destination', header: 'Destination', meta: { class: { th: 'column-destination', td: 'timetable-table-cell departure-destination' } } },
]
</script>

<template>
  <div
    class="results-skeleton"
    aria-hidden="true"
  >
    <!--
      Hidden from assistive tech: USkeleton marks every block as a live alert, and an empty table means
      nothing to a screen reader (TimetableLoadingState and the page's live region speak instead).
      The results table's own classes (timetable-table.css), so the two can't drift apart. `loading`
      draws UTable's burgundy bar under the headers (a pulse under reduced motion); the `tr` class goes
      through `meta`, which reaches body rows only (`ui.tr` would hit the header row too).
    -->
    <UTable
      :data="skeletonRows"
      :columns="skeletonColumns"
      :meta="{ class: { tr: 'timetable-table-row skeleton-row' } }"
      :ui="{ base: 'timetable-table timetable-table-departures', th: 'timetable-table-head-cell', separator: 'timetable-table-separator' }"
      loading
    >
      <template #origin-cell>
        <div class="skeleton-lines">
          <USkeleton class="skeleton-bar skeleton-station" />
          <USkeleton class="skeleton-bar skeleton-time" />
        </div>
      </template>
      <template #info-cell>
        <div class="skeleton-lines">
          <USkeleton class="skeleton-bar skeleton-stops" />
          <USkeleton class="skeleton-bar skeleton-notes" />
        </div>
      </template>
      <template #destination-cell>
        <div class="skeleton-lines">
          <USkeleton class="skeleton-bar skeleton-station" />
          <USkeleton class="skeleton-bar skeleton-time" />
        </div>
      </template>
    </UTable>
  </div>
</template>

<style scoped>
/*
 * The table, cells, dividers, corners, columns and mobile cards come from timetable-table.css, as for
 * the results. Only the placeholder shapes are here. :deep() because UTable renders the cells' content.
 */

/* A grid, so the bars' margins add up rather than collapse */
.results-skeleton :deep(.skeleton-lines) {
  display: grid;
  justify-items: start;
}

.results-skeleton :deep(.departure-info .skeleton-lines) {
  justify-items: center;
}

.results-skeleton :deep(.departure-destination .skeleton-lines) {
  justify-items: end;
}

/*
 * Each bar fills exactly one line of text (1em tall, centred in a 1lh line), so a skeleton row is as
 * tall as a result row. Its own colour: USkeleton's maps to cream and would vanish on the cream row.
 */
.results-skeleton :deep(.skeleton-bar) {
  display: block;
  max-inline-size: 100%;
  block-size: 1em;
  margin-block: calc((1lh - 1em) / 2);
  background-color: var(--colour-skeleton);
  border-radius: var(--radius-sm);
}

/* About the length of a station name, at the results' station size */
.results-skeleton :deep(.skeleton-station) {
  inline-size: 6em;
  font-size: var(--font-size-lg);
}

.results-skeleton :deep(.skeleton-time) {
  inline-size: 3em;
}

.results-skeleton :deep(.skeleton-stops) {
  inline-size: 4em;
}

/* The row of symbols (TimetableResultInfo): two 1.5rem icons and their gap, under the stops */
.results-skeleton :deep(.skeleton-notes) {
  inline-size: 3.5rem;
  block-size: 1.5rem;
  margin-block: var(--space-1) 0;
}
</style>

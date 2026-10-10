<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

// Every placeholder row draws the same shapes, so a row only needs a key
interface ResultsSkeletonRow {
  id: string
}

// As many rows as the placeholder results, so the page barely moves when they arrive
const skeletonRows: ResultsSkeletonRow[] = Array.from({ length: 5 }, (_, rowIndex) => ({ id: `skeleton-row-${rowIndex + 1}` }))

// Display-only columns (no data behind them), with the results table's headers and column classes
const skeletonColumns: TableColumn<ResultsSkeletonRow>[] = [
  { id: 'origin', header: 'Origin', meta: { class: { th: 'column-origin', td: 'skeleton-cell skeleton-origin' } } },
  { id: 'info', header: 'Info', meta: { class: { th: 'column-info', td: 'skeleton-cell skeleton-info' } } },
  { id: 'destination', header: 'Destination', meta: { class: { th: 'column-destination', td: 'skeleton-cell skeleton-destination' } } },
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
      `loading` draws UTable's burgundy bar under the headers (a pulse under reduced motion); the `tr`
      class goes through `meta`, which reaches body rows only (`ui.tr` would hit the header row too).
    -->
    <UTable
      :data="skeletonRows"
      :columns="skeletonColumns"
      :meta="{ class: { tr: 'skeleton-row' } }"
      :ui="{ base: 'skeleton-table', th: 'skeleton-head-cell', separator: 'skeleton-separator' }"
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
 * Mirrors TimetableResults, so nothing jumps when the results replace it. :deep() because UTable
 * renders the table and the cells' content; unlayered, so these beat Nuxt UI's utilities.
 *
 * The rows sit flush against each other, as one block. Separate borders with no spacing, because
 * a collapsed table ignores border-radius on its cells.
 */
.results-skeleton :deep(.skeleton-table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

/* Replaces UTable's small header text (and its line height) with the results' */
.results-skeleton :deep(.skeleton-head-cell) {
  /* The bottom padding is the only gap: between the headers and the first row */
  padding: 0 var(--space-4) var(--space-3);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-base);
}

.results-skeleton :deep(.column-origin) {
  width: 30%;
  text-align: start;
}

.results-skeleton :deep(.column-info) {
  text-align: center;
}

.results-skeleton :deep(.column-destination) {
  width: 30%;
  text-align: end;
}

/* UTable's line under the headers; the loading bar takes its place */
.results-skeleton :deep(.skeleton-separator) {
  display: none;
}

/* Replaces UTable's row divider with our own, on the cells below */
.results-skeleton :deep(.skeleton-row) {
  border: 0;
}

/*
 * Replaces UTable's `p-4 text-sm` with the result cells' padding and text size. Background and divider
 * on the cells, not the row: the corners below are cell corners.
 */
.results-skeleton :deep(.skeleton-cell) {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  vertical-align: middle;
  background-color: var(--colour-surface-alt);
}

/* A faint line under each row but the last, to tell the rows apart */
.results-skeleton :deep(.skeleton-row:not(:last-child) .skeleton-cell) {
  border-bottom: 1px solid var(--colour-border-subtle);
}

/* Rounded like the search box: the first row's top corners and the last row's bottom corners */
.results-skeleton :deep(.skeleton-row:first-child .skeleton-origin) {
  border-top-left-radius: var(--radius-sm);
}

.results-skeleton :deep(.skeleton-row:first-child .skeleton-destination) {
  border-top-right-radius: var(--radius-sm);
}

/* On mobile the last card's bottom corners belong to its info cell instead (below) */
@media (min-width: 40rem) {
  .results-skeleton :deep(.skeleton-row:last-child .skeleton-origin) {
    border-bottom-left-radius: var(--radius-sm);
  }

  .results-skeleton :deep(.skeleton-row:last-child .skeleton-destination) {
    border-bottom-right-radius: var(--radius-sm);
  }
}

/* A grid, so the bars' margins add up rather than collapse */
.results-skeleton :deep(.skeleton-lines) {
  display: grid;
  justify-items: start;
}

.results-skeleton :deep(.skeleton-info .skeleton-lines) {
  justify-items: center;
}

.results-skeleton :deep(.skeleton-destination .skeleton-lines) {
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

/* Mobile: as the results, rows become two-row grids (origin + destination, then info) */
@media (max-width: 39.99rem) {
  .results-skeleton :deep(.skeleton-table),
  .results-skeleton :deep(thead),
  .results-skeleton :deep(tbody) {
    display: block;
  }

  .results-skeleton :deep(thead > tr:first-child) {
    display: flex;
    justify-content: space-between;
  }

  .results-skeleton :deep(.column-origin),
  .results-skeleton :deep(.column-destination) {
    width: auto;
  }

  /* The results only hide it visually (for screen readers); the skeleton is hidden from them already */
  .results-skeleton :deep(.column-info) {
    display: none;
  }

  /* minmax(0, 1fr): a bar can shrink to its column, so a narrow screen never scrolls sideways */
  .results-skeleton :deep(.skeleton-row) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      'origin destination'
      'info info';
  }

  .results-skeleton :deep(.skeleton-origin) {
    grid-area: origin;
  }

  .results-skeleton :deep(.skeleton-destination) {
    grid-area: destination;
  }

  .results-skeleton :deep(.skeleton-info) {
    grid-area: info;
    padding-top: 0;
  }

  /* The info cell is each card's bottom edge here, so only it keeps the divider */
  .results-skeleton :deep(.skeleton-row:not(:last-child) :is(.skeleton-origin, .skeleton-destination)) {
    border-bottom: 0;
  }

  /* The last card's bottom edge is its info cell, under origin and destination */
  .results-skeleton :deep(.skeleton-row:last-child .skeleton-info) {
    border-bottom-right-radius: var(--radius-sm);
    border-bottom-left-radius: var(--radius-sm);
  }
}
</style>

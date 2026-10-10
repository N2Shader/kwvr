<script setup lang="ts">
// Placeholder lines for the Key's symbols: a few, as most result sets use several
const keySkeletonLineCount = 3
</script>

<template>
  <div
    class="results-key-skeleton"
    aria-hidden="true"
  >
    <!--
      Stands in for the Key under the results (TimetableResultsKey), so the page doesn't shrink when
      they arrive. Hidden from assistive tech: USkeleton marks every block as a live alert.
    -->
    <USkeleton class="key-skeleton-bar key-skeleton-heading" />
    <div class="key-skeleton-lines">
      <div
        v-for="lineNumber in keySkeletonLineCount"
        :key="lineNumber"
        class="key-skeleton-line"
      >
        <USkeleton class="key-skeleton-icon" />
        <USkeleton class="key-skeleton-bar key-skeleton-text" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * Mirrors TimetableResultsKey and TimetableNoteList. A grid, so the bars' margins add up rather than
 * collapse (with each other and through the root).
 */
.results-key-skeleton {
  display: grid;
}

/*
 * Each bar fills exactly one line of text (1em tall, centred in a 1lh line). Their own colour:
 * USkeleton's maps to cream.
 */
.key-skeleton-bar {
  display: block;
  max-inline-size: 100%;
  block-size: 1em;
  margin-block: calc((1lh - 1em) / 2);
  background-color: var(--colour-skeleton);
  border-radius: var(--radius-sm);
}

/* The "Key" heading: large text at the headings' line height, with its gap below */
.key-skeleton-heading {
  inline-size: 2.5em;
  margin-block-end: calc((1lh - 1em) / 2 + var(--space-3));
  font-size: var(--font-size-lg);
  line-height: var(--line-height-tight);
}

.key-skeleton-lines {
  display: grid;
  gap: var(--space-3);
}

/* A symbol and its description, as in the note list */
.key-skeleton-line {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.key-skeleton-icon {
  flex-shrink: 0;
  inline-size: 1.5rem;
  block-size: 1.5rem;
  background-color: var(--colour-skeleton);
  border-radius: var(--radius-sm);
}

/* Descriptions of different lengths */
.key-skeleton-text {
  inline-size: 14em;
}

.key-skeleton-line:nth-child(2) .key-skeleton-text {
  inline-size: 10em;
}

.key-skeleton-line:nth-child(3) .key-skeleton-text {
  inline-size: 12em;
}
</style>

<script setup lang="ts">
import type { TrainServiceNote } from '~/types/timetable'

// A timetable symbol with its label in a tooltip on hover. Reka's HoverCard (UPopover's hover mode)
// keeps the tooltip open while the pointer is on it and closes it on Esc (WCAG 1.4.13).
defineProps<{
  note: TrainServiceNote
}>()
</script>

<template>
  <UPopover
    mode="hover"
    :open-delay="150"
    :close-delay="100"
    :content="{ side: 'top', sideOffset: 6 }"
    :ui="{ content: 'note-tooltip-surface' }"
    arrow
  >
    <img
      :src="note.iconSrc"
      :alt="note.label"
      width="24"
      height="24"
      class="result-note-icon"
    >
    <template #content>
      <!-- Hidden from assistive tech: the icon's alt text already says it -->
      <span
        class="note-tooltip"
        aria-hidden="true"
      >{{ note.label }}</span>
    </template>
  </UPopover>
</template>

<style scoped>
.result-note-icon {
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  transition: transform var(--duration-fast) ease;
}

/* Pointer devices only; the global reduced-motion guard drops the transition */
@media (hover: hover) {
  .result-note-icon:hover {
    transform: scale(1.1);
  }
}
</style>

<style>
/* Non-scoped: the tooltip is portalled to the end of <body> */
.note-tooltip-surface {
  max-width: 16rem;
  padding: var(--space-1) var(--space-2);
  color: var(--colour-text);
  background-color: var(--colour-surface);
  border-radius: var(--radius-sm);
}

.note-tooltip {
  display: block;
  font-size: var(--font-size-xs);
  line-height: var(--line-height-tight);
}
</style>

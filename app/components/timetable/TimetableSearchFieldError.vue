<script setup lang="ts">
defineProps<{
  /** Referenced by the control's aria-describedby, so the message is read with the field */
  id: string
  message: string
}>()
</script>

<template>
  <!-- A <span>, not a <p>: it sits inside the field's <label>, which only allows phrasing content -->
  <span
    :id="id"
    class="search-field-error"
  >
    <!-- The message isn't told by its colour alone: screen readers hear "Error:" first -->
    <span class="visually-hidden">Error: </span>{{ message }}
  </span>
</template>

<style scoped>
.search-field-error {
  display: block;
  font-size: var(--font-size-xs);
  line-height: var(--line-height-tight);
  color: var(--colour-text-error);
  /* Wraps to the field's width instead of widening it, so the row doesn't shift when an error appears */
  contain: inline-size;
}
</style>

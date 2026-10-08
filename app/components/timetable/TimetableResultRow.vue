<script setup lang="ts">
import type { TrainService } from '~/types/timetable'

defineProps<{
  service: TrainService
}>()
</script>

<template>
  <!-- Explicit roles: see TimetableResults.vue -->
  <!-- eslint-disable vuejs-accessibility/no-redundant-roles -->
  <tr
    role="row"
    class="result-row"
    :class="{ 'has-service-alert': service.hasServiceAlert }"
  >
    <th
      role="rowheader"
      scope="row"
      class="result-cell result-origin"
    >
      <span class="result-station">{{ service.origin.name }}</span>
      <time
        :datetime="service.departsAt"
        class="result-time"
      >{{ formatClockTime(service.departsAt) }}</time>
    </th>
    <td
      role="cell"
      class="result-cell result-info"
    >
      <span class="result-stops">{{ formatStopCount(service.stopCount) }}</span>
      <!-- Text label, so the alert isn't conveyed by the row colour alone -->
      <strong
        v-if="service.hasServiceAlert"
        class="result-alert"
      >Service alert</strong>
    </td>
    <td
      role="cell"
      class="result-cell result-destination"
    >
      <span class="result-station">{{ service.destination.name }}</span>
      <time
        :datetime="service.arrivesAt"
        class="result-time"
      >{{ formatClockTime(service.arrivesAt) }}</time>
    </td>
  </tr>
  <!-- eslint-enable vuejs-accessibility/no-redundant-roles -->
</template>

<style scoped>
/* Background on the row: with zero horizontal border-spacing it reads as one card */
.result-row {
  background-color: var(--colour-surface-alt);
}

.result-row.has-service-alert {
  background-color: var(--colour-surface-alert);
}

.result-cell {
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-weight-regular);
  vertical-align: middle;
}

.result-origin {
  text-align: start;
}

.result-info {
  text-align: center;
}

.result-destination {
  text-align: end;
}

.result-station,
.result-time,
.result-stops,
.result-alert {
  display: block;
}

.result-station {
  font-size: var(--font-size-lg);
}

.result-alert {
  font-weight: var(--font-weight-semibold);
  color: var(--colour-text-accent);
}

/* Mobile: origin and destination share the top line, info sits underneath */
@media (max-width: 39.99rem) {
  .result-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'origin destination'
      'info info';
    border-radius: var(--radius-sm);
  }

  .result-origin {
    grid-area: origin;
  }

  .result-destination {
    grid-area: destination;
  }

  .result-info {
    grid-area: info;
    padding-top: 0;
  }
}
</style>

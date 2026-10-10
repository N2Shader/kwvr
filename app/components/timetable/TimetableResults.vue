<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { TimetableSearchCriteria, TrainService } from '~/types/timetable'

const props = defineProps<{
  services: TrainService[]
  searchCriteria: TimetableSearchCriteria
}>()

const captionText = computed(() => {
  const { origin, departingAfter } = props.searchCriteria
  return `Departures from ${origin.name} after ${formatClockTime(departingAfter)} on ${formatLongDate(departingAfter)}`
})

// The cells are drawn by the slots below, so the columns only carry their headers and classes
const resultColumns: TableColumn<TrainService>[] = [
  { id: 'origin', header: 'Origin', meta: { class: { th: 'column-origin', td: 'timetable-table-cell departure-origin' } } },
  { id: 'info', header: 'Info', meta: { class: { th: 'column-info', td: 'timetable-table-cell departure-info' } } },
  { id: 'destination', header: 'Destination', meta: { class: { th: 'column-destination', td: 'timetable-table-cell departure-destination' } } },
]

// Through `meta`, which reaches body rows only (`ui.tr` would hit the header row too)
const resultTableMeta = {
  class: {
    tr: ({ original }: { original: TrainService }) => [
      'timetable-table-row result-row',
      original.hasServiceAlert ? 'has-service-alert' : '',
      original.isLastTrain ? 'is-last-train' : '',
    ].filter(Boolean).join(' '),
  },
}

const resultsSection = useTemplateRef<HTMLElement>('resultsSection')
useResultRowsEntranceMotion(resultsSection)

// Kept after close, so the modal doesn't empty while it fades out
const selectedService = shallowRef<TrainService>()
const journeyModalTrigger = shallowRef<HTMLElement>()
const isJourneyModalOpen = ref(false)

const openJourneyModal = (service: TrainService, trigger: HTMLButtonElement) => {
  selectedService.value = service
  journeyModalTrigger.value = trigger
  isJourneyModalOpen.value = true
}

/*
 * The symbol icons sit above the row's hit area (so their tooltips work), so a click on one would miss
 * the row's button: hand it on. In script, so no click handler sits on a static element.
 */
useEventListener(resultsSection, 'click', (event: MouseEvent) => {
  const clickedElement = event.target
  if (!(clickedElement instanceof Element) || !clickedElement.closest('.result-note-icon')) return
  clickedElement.closest('tr')?.querySelector<HTMLButtonElement>('.result-journey-button')?.click()
})
</script>

<template>
  <section
    ref="resultsSection"
    class="timetable-results"
  >
    <!-- A plain section around the container: it's the element the entrance motion and the click hand-off use -->
    <UContainer>
      <h2 class="visually-hidden">
        Departures
      </h2>
      <TimetableResultsDayHint :departing-after="searchCriteria.departingAfter" />
      <!--
        UTable renders a <table> with <caption> (screen readers only) and <th scope="col"> headers.
        Its body cells are always <td>, so the origin isn't a row header. Its look, and the departures
        layout, are shared with the skeleton and the journey's stops (timetable-table.css).
      -->
      <UTable
        :data="services"
        :columns="resultColumns"
        :caption="captionText"
        :meta="resultTableMeta"
        :ui="{ base: 'timetable-table timetable-table-departures', th: 'timetable-table-head-cell', separator: 'timetable-table-separator' }"
      >
        <template #origin-cell="{ row }">
          <!-- Each row opens its journey: the button's hit area covers the whole row -->
          <TimetableResultJourneyButton
            :service="row.original"
            @open-journey="trigger => openJourneyModal(row.original, trigger)"
          />
          <TimetableResultStationTime
            :station-name="row.original.origin.name"
            :date-time="row.original.departsAt"
          />
        </template>
        <template #info-cell="{ row }">
          <TimetableResultInfo
            :stop-count="row.original.stopCount"
            :has-service-alert="row.original.hasServiceAlert"
            :notes="row.original.notes"
          />
        </template>
        <template #destination-cell="{ row }">
          <TimetableResultStationTime
            :station-name="row.original.destination.name"
            :date-time="row.original.arrivesAt"
          />
        </template>
      </UTable>
      <TimetableJourneyModal
        v-model:open="isJourneyModalOpen"
        :service="selectedService"
        :return-focus-target="journeyModalTrigger"
      />
    </UContainer>
  </section>
</template>

<style scoped>
/*
 * Results-only rules; the table's look (cells, dividers, corners) and the departures layout (columns,
 * mobile cards) are in timetable-table.css, shared with TimetableResultsSkeleton. :deep() because
 * UTable renders the table and the cells' content.
 */
.timetable-results {
  padding-block: var(--space-6);
}

/* The cells' content is styled in TimetableResultStationTime and TimetableResultInfo */

/* The containing block of the journey button's hit area (TimetableResultJourneyButton) */
.timetable-results :deep(.result-row) {
  position: relative;
}

/* Above the hit area, so their tooltips open; a click on one still opens the journey (script) */
.timetable-results :deep(.result-note-icon) {
  position: relative;
  z-index: 1;
  cursor: pointer;
}

/*
 * A darker background on hover, the text untouched (grey 8.2:1, burgundy 4.8:1 on the darker shades).
 * The background only, so nothing stacks above the hit area. No colour transition (motion stays on
 * transforms and opacity). Pointer devices only.
 */
@media (hover: hover) {
  .timetable-results :deep(.result-row:hover .timetable-table-cell) {
    background-color: var(--colour-surface-alt-hover);
  }

  .timetable-results :deep(.result-row.is-last-train:hover .timetable-table-cell) {
    background-color: var(--colour-surface-last-train-hover);
  }

  /* After the last train's rule: an alert's tint wins on a row that is both */
  .timetable-results :deep(.result-row.has-service-alert:hover .timetable-table-cell) {
    background-color: var(--colour-surface-alert-hover);
  }
}
</style>

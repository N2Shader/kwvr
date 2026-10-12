<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { TrainService, TrainServiceCall } from '~/types/timetable'

// One result's journey: its stops from the searched station to the last, then what its symbols mean.
// UModal gives the dialog role, the focus trap, Esc and the close button. Its `ui` classes are styled
// in the non-scoped block below, because the modal is portalled to the end of <body>.
// `scrollable`: the overlay scrolls the whole modal, so on a short screen the header and the stops
// table keep their natural size instead of being squeezed into a capped, self-scrolling body.
const props = defineProps<{
  service: TrainService | undefined
  /** Where focus goes back to on close: the row's button that opened it */
  returnFocusTarget?: HTMLElement
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const modalTitle = computed(() => props.service ? `${props.service.origin.name} to ${props.service.destination.name}` : '')

const modalDescription = computed(() => {
  if (!props.service) return ''
  const { departsAt, stopCount, isLastTrain } = props.service
  const journeyDescription = `Departs ${formatClockTime(departsAt)} on ${formatLongDate(departsAt)} · ${formatStopCount(stopCount)}`
  return isLastTrain ? `${journeyDescription} · Last train` : journeyDescription
})

const notesHeadingId = useId()

const stopsCaption = computed(() => props.service ? `Stops from ${props.service.origin.name} to ${props.service.destination.name}` : '')

// The key's wording for request stops, once, if the journey has any
const requestStopDescription = computed(() => props.service?.calls.find(call => call.requestStopDescription)?.requestStopDescription)

// The cells are drawn by the slots below; the classes give it the results table's look (timetable-table.css)
const stopColumns: TableColumn<TrainServiceCall>[] = [
  { id: 'station', header: 'Station', meta: { class: { th: 'journey-column-station', td: 'timetable-table-cell journey-stop-station' } } },
  { id: 'time', header: 'Time', meta: { class: { th: 'journey-column-time', td: 'timetable-table-cell journey-stop-time' } } },
]

/*
 * Safari doesn't focus a button on click, so reka's own focus return can land on <body>.
 * Send it back to the row's button instead.
 */
const modalContentProps = computed(() => ({
  onCloseAutoFocus: (event: Event) => {
    if (!props.returnFocusTarget) return
    event.preventDefault()
    props.returnFocusTarget.focus()
  },
}))
</script>

<template>
  <UModal
    v-model:open="isOpen"
    scrollable
    :title="modalTitle"
    :description="modalDescription"
    :content="modalContentProps"
    :ui="{
      content: 'journey-modal',
      header: 'journey-modal-header',
      title: 'journey-modal-title',
      description: 'journey-modal-description',
      body: 'journey-modal-body',
    }"
  >
    <template
      v-if="service"
      #body
    >
      <UTable
        :data="service.calls"
        :columns="stopColumns"
        :caption="stopsCaption"
        :meta="{ class: { tr: 'timetable-table-row' } }"
        :ui="{ base: 'timetable-table', th: 'timetable-table-head-cell', separator: 'timetable-table-separator' }"
      >
        <template #station-cell="{ row }">
          <span class="journey-stop-name">{{ row.original.station.name }}</span>
          <!-- Text label, explained under "About this journey" -->
          <span
            v-if="row.original.requestStopDescription"
            class="journey-request-stop"
          >Request stop</span>
          <span
            v-if="row.original.notes.length > 0"
            class="journey-stop-notes"
          >
            <TimetableNoteIcon
              v-for="note in row.original.notes"
              :key="note.code"
              :note="note"
            />
          </span>
        </template>
        <template #time-cell="{ row }">
          <time
            :datetime="row.original.time"
            class="journey-stop-clock"
          >{{ formatClockTime(row.original.time) }}</time>
          <span class="journey-stop-time-type">{{ row.original.timeType === 'departure' ? 'Departs' : 'Arrives' }}</span>
        </template>
      </UTable>

      <section
        v-if="service.notes.length > 0 || requestStopDescription"
        class="journey-notes"
        :aria-labelledby="notesHeadingId"
      >
        <h3
          :id="notesHeadingId"
          class="journey-notes-heading"
        >
          About this journey
        </h3>
        <TimetableNoteList :notes="service.notes">
          <li
            v-if="requestStopDescription"
            class="journey-notes-request-stop"
          >
            <span class="journey-request-stop">Request stop</span>
            <span>{{ requestStopDescription }}</span>
          </li>
        </TimetableNoteList>
      </section>
    </template>
  </UModal>
</template>

<style>
/* Non-scoped (the modal is portalled). Tokens only; unlayered, so these beat UModal's utilities */
.journey-modal {
  max-width: 36rem;
  color: var(--colour-text);
  background-color: var(--colour-surface);
  border-radius: var(--radius-md);
}

.journey-modal-header {
  padding: var(--space-4) var(--space-5);
  /* Room for the close button in the corner */
  padding-inline-end: var(--space-8);
}

.journey-modal-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: var(--colour-text-accent);
}

.journey-modal-description {
  margin-top: var(--space-1);
  font-size: var(--font-size-base);
}

.journey-modal-body {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-4) var(--space-5) var(--space-5);
}

.journey-column-station,
.journey-stop-station {
  text-align: start;
}

.journey-column-time,
.journey-stop-time {
  width: 30%;
  text-align: end;
}

.journey-stop-name,
.journey-stop-clock,
.journey-stop-time-type {
  display: block;
}

.journey-stop-name {
  font-size: var(--font-size-lg);
}

.journey-stop-time-type {
  font-size: var(--font-size-sm);
}

/* A text tag, not a colour, says the train only stops on request */
.journey-request-stop {
  display: inline-block;
  flex-shrink: 0;
  padding: 0 var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--colour-text-accent);
  border: 1px solid currentcolor;
  border-radius: var(--radius-sm);
}

.journey-stop-notes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

/*
 * The tag above its wording, not beside it, so the wording keeps the full width. Beats
 * TimetableNoteList's row layout (`li[data-v-…-s]`) on specificity.
 */
.journey-notes li.journey-notes-request-stop {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
}

.journey-notes-heading {
  margin-bottom: var(--space-3);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}
</style>

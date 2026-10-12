import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableJourneyModal from '~/components/timetable/TimetableJourneyModal.vue'
import { requestStopDescriptionFixture, servicesFixture } from '../../fixtures/timetableFixtures'

// The first fixture: Haworth 12:20 to Keighley 13:00, with Damems on request
const [haworthToKeighleyService] = servicesFixture

// Attached to the document because the modal is portalled to <body>
const mountOpenJourneyModal = async (service = haworthToKeighleyService) => {
  const wrapper = await mountSuspended(TimetableJourneyModal, {
    props: { service, open: true },
    attachTo: document.body,
  })
  await vi.waitFor(() => expect(document.body.querySelector('[role="dialog"]')).not.toBeNull())
  return { wrapper, journeyDialog: document.body.querySelector<HTMLElement>('[role="dialog"]') }
}

describe('TimetableJourneyModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('names the journey, with its departure and stop count', async () => {
    const { journeyDialog } = await mountOpenJourneyModal()

    expect(journeyDialog?.querySelector('h2')?.textContent).toBe('Haworth to Keighley')
    expect(journeyDialog?.textContent).toContain('Departs 12:20 on 24 April 2026 · 3 stops')
    expect(journeyDialog?.textContent).not.toContain('Last train')
  })

  it('says when the journey is the last train, and explains its symbol', async () => {
    const { journeyDialog } = await mountOpenJourneyModal(servicesFixture[3])
    const noteLines = Array.from(journeyDialog?.querySelectorAll('.journey-notes li') ?? []).map(noteLine => noteLine.textContent?.trim())

    expect(journeyDialog?.textContent).toContain('Departs 17:20 on 24 April 2026 · Direct · Last train')
    expect(noteLines[0]).toBe('Last train of the day from this station')
  })

  it('lists every stop from the boarding station on, with its time and whether the train departs or arrives', async () => {
    const { journeyDialog } = await mountOpenJourneyModal()
    const stopsTable = journeyDialog?.querySelector('table')
    const stopRows = Array.from(stopsTable?.querySelectorAll('tbody tr') ?? [])
    const stationNames = stopRows.map(stopRow => stopRow.querySelector('.journey-stop-name')?.textContent)
    const lastStopTime = stopRows.at(-1)?.querySelector('time')

    expect(stopsTable?.querySelector('caption')?.textContent).toBe('Stops from Haworth to Keighley')
    expect(Array.from(stopsTable?.querySelectorAll('thead th[scope="col"]') ?? []).map(columnHeader => columnHeader.textContent)).toEqual(['Station', 'Time'])
    expect(stationNames).toEqual(['Haworth', 'Oakworth', 'Damems', 'Ingrow West', 'Keighley'])
    expect(stopRows[0]?.querySelector('.journey-stop-time')?.textContent).toContain('Departs')
    expect(lastStopTime?.getAttribute('datetime')).toBe('2026-04-24T13:00')
    expect(lastStopTime?.textContent).toBe('13:00')
    expect(stopRows.at(-1)?.querySelector('.journey-stop-time')?.textContent).toContain('Arrives')
  })

  it('marks the request stop in text and shows each station’s symbols', async () => {
    const { journeyDialog } = await mountOpenJourneyModal()
    const stopRows = Array.from(journeyDialog?.querySelectorAll('tbody tr') ?? [])
    const requestStopRows = stopRows.filter(stopRow => stopRow.querySelector('.journey-request-stop'))

    expect(requestStopRows.map(stopRow => stopRow.querySelector('.journey-stop-name')?.textContent)).toEqual(['Damems'])
    expect(stopRows[3]?.querySelector('img')?.getAttribute('alt')).toBe('Rail Story museums at Ingrow')
  })

  it('explains only this journey’s symbols, plus the request stop', async () => {
    const { journeyDialog } = await mountOpenJourneyModal()
    const journeyNotes = journeyDialog?.querySelector('.journey-notes')
    const noteLines = Array.from(journeyNotes?.querySelectorAll('li') ?? []).map(noteLine => noteLine.textContent?.trim())

    expect(journeyNotes?.querySelector('h3')?.textContent?.trim()).toBe('About this journey')
    expect(noteLines).toEqual([
      'Diesel Train',
      'Alight at Ingrow for “Rail Story” museums & exhibitions.',
      'Connections with National Rail services.',
      `Request stop${requestStopDescriptionFixture}`,
    ])
  })

  it('has no "About this journey" when the journey has no symbols or request stops', async () => {
    const { journeyDialog } = await mountOpenJourneyModal(servicesFixture[1])

    expect(journeyDialog?.querySelector('.journey-notes')).toBeNull()
  })

  it('scrolls as a whole, not inside its body', async () => {
    const { journeyDialog } = await mountOpenJourneyModal()

    expect(journeyDialog?.closest('[data-slot="overlay"]')).not.toBeNull()
  })

  it('has no detectable accessibility violations', async () => {
    const { journeyDialog } = await mountOpenJourneyModal()

    expect(await axe(journeyDialog?.outerHTML ?? '')).toHaveNoViolations()
  })
})

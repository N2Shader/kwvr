import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableResults from '~/components/timetable/TimetableResults.vue'
import { searchCriteriaFixture, servicesFixture } from '../../fixtures/timetableFixtures'

// Attached to the document because the journey modal is portalled to <body>
const mountResults = () => mountSuspended(TimetableResults, {
  props: { services: servicesFixture, searchCriteria: searchCriteriaFixture },
  attachTo: document.body,
})

describe('TimetableResults', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders a captioned table with column headers', async () => {
    const wrapper = await mountResults()
    const resultsTable = wrapper.find('table')

    expect(resultsTable.find('caption').text()).toBe('Departures from Haworth after 12:00 on 24 April 2026')
    expect(resultsTable.findAll('thead th[scope="col"]').map(columnHeader => columnHeader.text())).toEqual(['Origin', 'Info', 'Destination'])
    expect(resultsTable.findAll('tbody tr')).toHaveLength(servicesFixture.length)
  })

  it('writes the table\'s roles out, so it stays a table when its rows turn into cards on mobile (Safari)', async () => {
    const wrapper = await mountResults()
    const resultsTable = wrapper.get('table')

    expect(resultsTable.attributes('role')).toBe('table')
    resultsTable.findAll('thead, tbody').forEach(rowGroup => expect(rowGroup.attributes('role')).toBe('rowgroup'))
    resultsTable.findAll('tbody tr').forEach(resultRow => expect(resultRow.attributes('role')).toBe('row'))
    resultsTable.findAll('th[scope="col"]').forEach(columnHeader => expect(columnHeader.attributes('role')).toBe('columnheader'))
    resultsTable.findAll('tbody td').forEach(resultCell => expect(resultCell.attributes('role')).toBe('cell'))
  })

  it('starts each row with the origin and its departure time', async () => {
    const wrapper = await mountResults()
    const firstOriginCell = wrapper.find('tbody tr .departure-origin')
    const departureTime = firstOriginCell.find('time')

    expect(firstOriginCell.text()).toContain('Haworth')
    expect(departureTime.attributes('datetime')).toBe('2026-04-24T12:20')
    expect(departureTime.text()).toBe('12:20')
  })

  it('shows the stop count and the destination with its arrival time', async () => {
    const wrapper = await mountResults()
    const [firstRow, secondRow] = wrapper.findAll('tbody tr')
    const arrivalTime = firstRow?.find('.departure-destination time')

    expect(firstRow?.find('.departure-info').text()).toBe('3 stops')
    expect(secondRow?.find('.departure-info').text()).toBe('Direct')
    expect(firstRow?.find('.departure-destination').text()).toContain('Keighley')
    expect(arrivalTime?.attributes('datetime')).toBe('2026-04-24T13:00')
    expect(arrivalTime?.text()).toBe('13:00')
  })

  it('shows the timetable symbols of each row in the Info column, with their meaning as alt text', async () => {
    const wrapper = await mountResults()
    const [firstRow, secondRow] = wrapper.findAll('tbody tr')
    const firstRowIcons = firstRow?.findAll('.departure-info img') ?? []

    expect(firstRowIcons.map(noteIcon => noteIcon.attributes('alt'))).toEqual(['Diesel train', 'Rail Story museums at Ingrow', 'National Rail connections'])
    expect(firstRowIcons[0]?.attributes('src')).toBe('/images/timetable-key/diesel.webp')
    expect(secondRow?.find('.departure-info img').exists()).toBe(false)
  })

  it('labels service alerts in text, not by colour alone', async () => {
    const wrapper = await mountResults()
    const resultRows = wrapper.findAll('tbody tr')
    const alertRows = resultRows.filter(resultRow => resultRow.classes('has-service-alert'))

    expect(alertRows).toHaveLength(1)
    expect(alertRows[0]?.text()).toContain('Service alert')
    resultRows
      .filter(resultRow => !resultRow.classes('has-service-alert'))
      .forEach(resultRow => expect(resultRow.text()).not.toContain('Service alert'))
  })

  it('tints the last train, with its symbol first and its button saying so', async () => {
    const wrapper = await mountResults()
    const resultRows = wrapper.findAll('tbody tr')
    const lastTrainRows = resultRows.filter(resultRow => resultRow.classes('is-last-train'))

    expect(lastTrainRows).toHaveLength(1)
    expect(resultRows.at(-1)?.classes('is-last-train')).toBe(true)
    expect(lastTrainRows[0]?.find('.departure-info img').attributes('alt')).toBe('Last train')
    expect(lastTrainRows[0]?.find('.result-journey-button').text()).toBe('Journey details: Haworth 17:20 to Oxenhope 17:30, last train')
    expect(resultRows[0]?.find('.result-journey-button').text()).not.toContain('last train')
  })

  it('shades the trains to Keighley, which their Destination column names too', async () => {
    const wrapper = await mountResults()
    const resultRows = wrapper.findAll('tbody tr')

    expect(resultRows.map(resultRow => resultRow.classes('is-to-keighley'))).toEqual([true, false, true, false])
    resultRows
      .filter(resultRow => resultRow.classes('is-to-keighley'))
      .forEach(resultRow => expect(resultRow.find('.departure-destination').text()).toContain('Keighley'))
  })

  it('gives each row a button that names the journey it opens', async () => {
    const wrapper = await mountResults()
    const journeyButtons = wrapper.findAll('tbody tr .result-journey-button')

    expect(journeyButtons).toHaveLength(servicesFixture.length)
    expect(journeyButtons[0]?.attributes('aria-haspopup')).toBe('dialog')
    expect(journeyButtons[0]?.text()).toBe('Journey details: Haworth 12:20 to Keighley 13:00')
  })

  it('opens the journey in a modal, with its stops, when a row is chosen', async () => {
    const wrapper = await mountResults()

    await wrapper.get('tbody tr .result-journey-button').trigger('click')
    await vi.waitFor(() => expect(document.body.querySelector('[role="dialog"]')).not.toBeNull())
    const journeyDialog = document.body.querySelector('[role="dialog"]')

    expect(journeyDialog?.querySelector('h2')?.textContent).toBe('Haworth to Keighley')
    expect(journeyDialog?.querySelector('caption')?.textContent).toBe('Stops from Haworth to Keighley')
    expect(journeyDialog?.querySelectorAll('tbody tr')).toHaveLength(5)
  })

  it('opens the journey when one of the row’s symbols is clicked too', async () => {
    const wrapper = await mountResults()

    wrapper.get('tbody tr .result-note-icon').element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    await vi.waitFor(() => expect(document.body.querySelector('[role="dialog"]')).not.toBeNull())
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountResults()

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

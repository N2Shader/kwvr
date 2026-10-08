import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableResults from '~/components/timetable/TimetableResults.vue'
import { searchCriteriaFixture, servicesFixture } from '../../fixtures/timetableFixtures'

const mountResults = () => mountSuspended(TimetableResults, {
  props: { services: servicesFixture, searchCriteria: searchCriteriaFixture },
})

describe('TimetableResults', () => {
  it('renders a captioned semantic table', async () => {
    const wrapper = await mountResults()
    const resultsTable = wrapper.find('table')

    expect(resultsTable.find('caption').text()).toBe('Departures from Haworth after 12:00 on 24 April 2026')
    expect(resultsTable.findAll('thead th[scope="col"]').map(columnHeader => columnHeader.text())).toEqual(['Origin', 'Info', 'Destination'])
    expect(resultsTable.findAll('tbody tr')).toHaveLength(servicesFixture.length)
  })

  it('heads each row with the origin and its departure time', async () => {
    const wrapper = await mountResults()
    const firstRowHeader = wrapper.find('tbody tr th[scope="row"]')
    const departureTime = firstRowHeader.find('time')

    expect(firstRowHeader.text()).toContain('Haworth')
    expect(departureTime.attributes('datetime')).toBe('2026-04-24T12:20')
    expect(departureTime.text()).toBe('12:20')
  })

  it('shows the stop count and the destination with its arrival time', async () => {
    const wrapper = await mountResults()
    const [firstRow, secondRow] = wrapper.findAll('tbody tr')
    const arrivalTime = firstRow?.find('.result-destination time')

    expect(firstRow?.find('.result-info').text()).toBe('4 stops')
    expect(secondRow?.find('.result-info').text()).toBe('Direct')
    expect(firstRow?.find('.result-destination').text()).toContain('Keighley')
    expect(arrivalTime?.attributes('datetime')).toBe('2026-04-24T13:00')
    expect(arrivalTime?.text()).toBe('13:00')
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

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountResults()

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableSearchForm from '~/components/timetable/TimetableSearchForm.vue'
import { searchCriteriaFixture, stationsFixture } from '../../fixtures/timetableFixtures'

const mountSearchForm = () => mountSuspended(TimetableSearchForm, {
  props: { stations: stationsFixture, defaultCriteria: searchCriteriaFixture },
})

describe('TimetableSearchForm', () => {
  it('is a search landmark labelled by its fieldset legend', async () => {
    const wrapper = await mountSearchForm()
    const searchForm = wrapper.find('form[role="search"]')
    const legend = searchForm.find('fieldset > legend')

    expect(legend.text()).toBe('Search train times')
    expect(searchForm.attributes('aria-labelledby')).toBe(legend.attributes('id'))
  })

  it('gives every control a visible label tied to it by id', async () => {
    const wrapper = await mountSearchForm()
    const fieldLabels = wrapper.findAll('label')

    expect(fieldLabels.map(fieldLabel => fieldLabel.find('.search-field-label').text())).toEqual(['Departing from', 'Date and time'])
    fieldLabels.forEach((fieldLabel) => {
      const labelledControl = fieldLabel.find('select, input')
      expect(fieldLabel.attributes('for')).toBe(labelledControl.attributes('id'))
    })
  })

  it('lists every station and preselects the default origin', async () => {
    const wrapper = await mountSearchForm()
    const originSelect = wrapper.find('select')

    expect(originSelect.findAll('option').map(stationOption => stationOption.text())).toEqual(['Keighley', 'Haworth', 'Oxenhope'])
    expect((originSelect.element as HTMLSelectElement).value).toBe('haworth')
  })

  it('prefills the date and time with the default departure', async () => {
    const wrapper = await mountSearchForm()
    const departingAfterInput = wrapper.find('input[type="datetime-local"]')

    expect((departingAfterInput.element as HTMLInputElement).value).toBe('2026-04-24T12:00')
  })

  it('does not navigate away on submit', async () => {
    const wrapper = await mountSearchForm()
    const submitEvent = new Event('submit', { cancelable: true })

    wrapper.find('form').element.dispatchEvent(submitEvent)

    expect(submitEvent.defaultPrevented).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Search')
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSearchForm()

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

import { nextTick } from 'vue'
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

    expect(fieldLabels.map(fieldLabel => fieldLabel.find('.search-field-label').text())).toEqual(['Departing from', 'Date', 'Time'])
    fieldLabels.forEach((fieldLabel) => {
      // Origin → the combobox trigger, date → the calendar button, time → the hidden input that forwards focus
      const labelledControl = fieldLabel.find(`[id="${fieldLabel.attributes('for')}"]`)
      expect(labelledControl.exists()).toBe(true)
    })
  })

  it('names the origin combobox with its visible label', async () => {
    const wrapper = await mountSearchForm()
    const originLabelText = wrapper.findAll('.search-field-label').find(fieldLabelText => fieldLabelText.text() === 'Departing from')
    const originCombobox = wrapper.find('[role="combobox"]')

    expect(originCombobox.attributes('aria-labelledby')).toBe(originLabelText?.attributes('id'))
  })

  it('lists every station and preselects the default origin', async () => {
    // Attached to the document because the options are portalled to <body>
    const wrapper = await mountSuspended(TimetableSearchForm, {
      props: { stations: stationsFixture, defaultCriteria: searchCriteriaFixture },
      attachTo: document.body,
    })
    const originCombobox = wrapper.find('[role="combobox"]')

    expect(originCombobox.text()).toBe('Haworth')

    await originCombobox.trigger('keydown', { key: 'Enter' })
    await nextTick()

    const stationOptions = Array.from(document.body.querySelectorAll('[role="option"]'))
    expect(stationOptions.map(stationOption => stationOption.textContent?.trim())).toEqual(['Keighley', 'Haworth', 'Oxenhope'])

    wrapper.unmount()
  })

  it('starts on "Select a station" without adding it as an option when there is no default origin', async () => {
    const wrapper = await mountSuspended(TimetableSearchForm, {
      props: { stations: stationsFixture, defaultCriteria: {} },
      attachTo: document.body,
    })
    const originCombobox = wrapper.find('[role="combobox"]')

    expect(originCombobox.text()).toBe('Select a station')

    await originCombobox.trigger('keydown', { key: 'Enter' })
    await nextTick()

    const stationOptions = Array.from(document.body.querySelectorAll('[role="option"]'))
    expect(stationOptions.map(stationOption => stationOption.textContent?.trim())).toEqual(['Keighley', 'Haworth', 'Oxenhope'])

    wrapper.unmount()
  })

  it('marks the origin combobox as expanded while the menu is open (the chevron flips on this)', async () => {
    const wrapper = await mountSuspended(TimetableSearchForm, {
      props: { stations: stationsFixture, defaultCriteria: searchCriteriaFixture },
      attachTo: document.body,
    })
    const originCombobox = wrapper.find('[role="combobox"]')

    expect(originCombobox.attributes('aria-expanded')).toBe('false')

    await originCombobox.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(originCombobox.attributes('aria-expanded')).toBe('true')

    wrapper.unmount()
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

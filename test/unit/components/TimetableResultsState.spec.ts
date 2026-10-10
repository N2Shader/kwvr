import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableResultsState from '~/components/timetable/TimetableResultsState.vue'
import { searchCriteriaFixture, servicesFixture } from '../../fixtures/timetableFixtures'

const mountResultsState = () => mountSuspended(TimetableResultsState, {
  props: { criteria: searchCriteriaFixture, services: servicesFixture },
})

describe('TimetableResultsState', () => {
  it('shows one results row per service', async () => {
    const wrapper = await mountResultsState()

    expect(wrapper.find('.results-state table').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(servicesFixture.length)
  })

  it('explains the symbols the results use in a key, each once', async () => {
    const wrapper = await mountResultsState()
    const resultsKey = wrapper.find('.results-key')

    expect(resultsKey.find('h3').text()).toBe('Key')
    expect(resultsKey.findAll('li').map(keyItem => keyItem.text())).toEqual([
      'Diesel Train',
      'Alight at Ingrow for “Rail Story” museums & exhibitions.',
      'Connections with National Rail services.',
      'Steam Train',
      'This train includes a Real Ale Bar Car.',
    ])
    // The text says what each icon means, so the icons themselves are decorative here
    resultsKey.findAll('img').forEach(keyIcon => expect(keyIcon.attributes('alt')).toBe(''))
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountResultsState()

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

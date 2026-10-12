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
      'Last train of the day from this station in this direction',
    ])
    // The text says what each icon means, so the icons themselves are decorative here
    resultsKey.findAll('img').forEach(keyIcon => expect(keyIcon.attributes('alt')).toBe(''))
  })

  it('shows the searched station’s info and map', async () => {
    const wrapper = await mountResultsState()
    const stationInfo = wrapper.get('.station-info')

    expect(stationInfo.get('h2').text()).toBe('Haworth Station')
    expect(stationInfo.get('iframe').attributes('title')).toBe('Map of Haworth station')
  })

  it('suggests three other stations, never the searched one', async () => {
    const wrapper = await mountResultsState()

    const cardTitles = wrapper.findAll('.station-suggestions li h3').map(cardTitle => cardTitle.text())
    expect(cardTitles).toHaveLength(3)
    expect(new Set(cardTitles).size).toBe(3)
    expect(cardTitles.some(cardTitle => cardTitle.startsWith('Haworth'))).toBe(false)
  })

  it('opens each suggested station’s kwvr.co.uk page in a new tab', async () => {
    const wrapper = await mountResultsState()

    const cardLinks = wrapper.findAll('.station-suggestions li a')
    expect(cardLinks).toHaveLength(3)
    for (const cardLink of cardLinks) {
      expect(cardLink.attributes('href')).toMatch(/^https:\/\/kwvr\.co\.uk\/visiting-the-kwvr\/stations\/[a-z-]+-station\/$/)
      expect(cardLink.attributes('href')).not.toContain('haworth')
      expect(cardLink.attributes('target')).toBe('_blank')
      expect(cardLink.attributes('rel')).toBe('noopener noreferrer')
      expect(cardLink.text()).toMatch(/ station \(opens in a new tab\)$/)
    }
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountResultsState()

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

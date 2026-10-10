import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableLoadingState from '~/components/timetable/TimetableLoadingState.vue'
import { searchCriteriaFixture } from '../../fixtures/timetableFixtures'

const mountLoadingState = () => mountSuspended(TimetableLoadingState, { props: { criteria: searchCriteriaFixture } })

describe('TimetableLoadingState', () => {
  it('is a busy section under the same heading as the results', async () => {
    const wrapper = await mountLoadingState()
    const loadingSection = wrapper.find('section.loading-state')
    const heading = wrapper.find('h2')

    expect(loadingSection.attributes('aria-busy')).toBe('true')
    expect(heading.text()).toBe('Departures')
    expect(loadingSection.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(wrapper.text()).toContain('Loading departures…')
  })

  it('hides the decorative skeleton from assistive tech', async () => {
    const wrapper = await mountLoadingState()

    expect(wrapper.find('.results-skeleton').attributes('aria-hidden')).toBe('true')
  })

  it('draws the results table\'s headers and five placeholder rows', async () => {
    const wrapper = await mountLoadingState()
    const skeletonTable = wrapper.find('.results-skeleton table')

    expect(skeletonTable.findAll('thead th').map(columnHeader => columnHeader.text())).toEqual(['Origin', 'Info', 'Destination'])
    expect(skeletonTable.findAll('tbody tr.skeleton-row')).toHaveLength(5)
  })

  it('draws a placeholder for the Key under the table, hidden from assistive tech', async () => {
    const wrapper = await mountLoadingState()
    const keySkeleton = wrapper.find('.results-key-skeleton')

    expect(keySkeleton.exists()).toBe(true)
    expect(keySkeleton.attributes('aria-hidden')).toBe('true')
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountLoadingState()

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

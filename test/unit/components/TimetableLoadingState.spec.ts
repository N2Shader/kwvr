import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableLoadingState from '~/components/timetable/TimetableLoadingState.vue'

describe('TimetableLoadingState', () => {
  it('is a busy section under the same heading as the results', async () => {
    const wrapper = await mountSuspended(TimetableLoadingState)
    const loadingSection = wrapper.find('section.loading-state')
    const heading = wrapper.find('h2')

    expect(loadingSection.attributes('aria-busy')).toBe('true')
    expect(heading.text()).toBe('Departures')
    expect(loadingSection.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(wrapper.text()).toContain('Loading departures…')
  })

  it('hides the decorative skeleton from assistive tech', async () => {
    const wrapper = await mountSuspended(TimetableLoadingState)

    expect(wrapper.find('.results-skeleton').attributes('aria-hidden')).toBe('true')
  })

  it('draws the results table\'s headers and five placeholder rows', async () => {
    const wrapper = await mountSuspended(TimetableLoadingState)
    const skeletonTable = wrapper.find('.results-skeleton table')

    expect(skeletonTable.findAll('thead th').map(columnHeader => columnHeader.text())).toEqual(['Origin', 'Info', 'Destination'])
    expect(skeletonTable.findAll('tbody tr.skeleton-row')).toHaveLength(5)
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSuspended(TimetableLoadingState)

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

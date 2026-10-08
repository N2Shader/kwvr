import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import IndexPage from '~/pages/index.vue'

// The page starts on the empty state until search is wired up.
// The results table itself is covered by TimetableResults.spec.ts.
describe('Index page', () => {
  it('has a single h1 and the search form', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Find train times')
    expect(wrapper.find('form[role="search"]').exists()).toBe(true)
  })

  it('shows the empty state by default, with no results, station info or attractions', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(wrapper.find('.empty-state').text()).toBe('Nothing to show here yet')
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.find('.station-info').exists()).toBe(false)
    expect(wrapper.find('.station-attractions').exists()).toBe(false)
  })

  it('keeps a polite live region for the results count', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(wrapper.find('[aria-live="polite"]').text()).toBe('No services found')
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

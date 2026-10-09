import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { axe } from 'vitest-axe'
import IndexPage from '~/pages/index.vue'

// The page starts on the first-use state until search is wired up.
// The results table itself is covered by TimetableResults.spec.ts.
describe('Index page', () => {
  it('has a single h1 and the search form', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Find train times')
    expect(wrapper.find('form[role="search"]').exists()).toBe(true)
  })

  it('shows the first-use state by default, with no results, station info or attractions', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(wrapper.find('.first-use-state h2').text()).toBe('Or catch the next train from…')
    expect(wrapper.findAll('.first-use-state li')).toHaveLength(6)
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.find('.station-info').exists()).toBe(false)
    expect(wrapper.find('.station-attractions').exists()).toBe(false)
  })

  it('keeps a polite live region for the results count, empty before any search', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    const resultsSummary = wrapper.find('.results-summary')

    expect(resultsSummary.attributes('aria-live')).toBe('polite')
    expect(resultsSummary.text()).toBe('')
  })

  it('searches for the next train from a station card through the search form', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 9, 14, 30))
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    // Attached to the document so the form can submit itself
    const wrapper = await mountSuspended(IndexPage, { route: '/', attachTo: document.body })

    await wrapper.get('.first-use-state li:nth-child(5) button').trigger('click')
    await flushPromises()

    expect(consoleLogSpy).toHaveBeenCalledWith('Search train times', { originId: 'haworth', departingDate: '2026-10-09', departingTime: '14:30:00' })

    wrapper.unmount()
    consoleLogSpy.mockRestore()
    vi.useRealTimers()
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

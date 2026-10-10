import { describe, expect, it, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import IndexPage from '~/pages/index.vue'
import type { TimetableApiResponse } from '~/types/timetableApi'
import { timetableResponseFixture } from '../../fixtures/timetableFixtures'

// The page starts on the first-use state; a search goes through loading to the results.
// The results table itself is covered by TimetableResults.spec.ts, the search flow by useTimetableSearch.spec.ts.
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

  it('searches for the next train from a station card, shows the loading state, then the results', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 9, 11, 30))
    // The endpoint holds its answer until the test releases it, so the loading state can be checked first.
    // `once`, because registrations for the same URL pile up across tests.
    let searchQuery: Record<string, string> = {}
    let answerTimetableSearch = () => {}
    const heldAnswer = new Promise<TimetableApiResponse>((resolve) => {
      answerTimetableSearch = () => resolve(timetableResponseFixture)
    })
    registerEndpoint('/api/timetable/search', {
      handler: (event) => {
        searchQuery = Object.fromEntries(new URL(event.path, 'http://localhost').searchParams)
        return heldAnswer
      },
      once: true,
    })
    // Attached to the document so the form can submit itself
    const wrapper = await mountSuspended(IndexPage, { route: '/', attachTo: document.body })

    await wrapper.get('.first-use-state li:nth-child(5) button').trigger('click')
    await vi.waitFor(() => expect(searchQuery).toEqual({ originId: 'haworth', departingAfter: '2026-10-09T11:30' }))

    expect(wrapper.find('.loading-state').exists()).toBe(true)
    expect(wrapper.find('.first-use-state').exists()).toBe(false)
    expect(wrapper.find('.results-summary').text()).toBe('Searching for departures from Haworth…')

    answerTimetableSearch()
    await vi.waitFor(() => expect(wrapper.find('.timetable-results table').exists()).toBe(true))

    expect(wrapper.find('.loading-state').exists()).toBe(false)
    expect(wrapper.find('.results-summary').text()).toBe('2 services found')

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

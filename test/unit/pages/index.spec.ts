import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import { useRouter } from '#imports'
import IndexPage from '~/pages/index.vue'
import TimetableOriginSelect from '~/components/timetable/TimetableOriginSelect.vue'
import type { TimetableApiResponse } from '~/types/timetableApi'
import { timetableResponseFixture } from '../../fixtures/timetableFixtures'

// Holds the endpoint's answer until the test releases it, so the loading state can be checked first.
// `once`, because registrations for the same URL pile up across tests.
const holdTimetableSearch = () => {
  const heldSearch = { query: {} as Record<string, string>, answer: () => {} }
  const heldAnswer = new Promise<TimetableApiResponse>((resolve) => {
    heldSearch.answer = () => resolve(timetableResponseFixture)
  })
  registerEndpoint('/api/timetable/search', {
    handler: (event) => {
      heldSearch.query = Object.fromEntries(new URL(event.path, 'http://localhost').searchParams)
      return heldAnswer
    },
    once: true,
  })
  return heldSearch
}

// The page starts on the first-use state; a search goes through loading to the results, and into the address bar.
// A search in the address bar (a shared link) runs from the start, unless the form refuses it.
// The results table itself is covered by TimetableResults.spec.ts, the search flow by useTimetableSearch.spec.ts.
describe('Index page', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('has a single h1 and the search form', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Find train times')
    expect(wrapper.find('form[role="search"]').exists()).toBe(true)
  })

  it('shows the first-use state by default, with no results, station info or station suggestions', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(wrapper.find('.first-use-state h2').text()).toBe('Or catch the next train from…')
    expect(wrapper.findAll('.first-use-state li')).toHaveLength(6)
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.find('.station-info').exists()).toBe(false)
    expect(wrapper.find('.station-suggestions').exists()).toBe(false)
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
    const heldSearch = holdTimetableSearch()
    // Attached to the document so the form can submit itself
    const wrapper = await mountSuspended(IndexPage, { route: '/', attachTo: document.body })

    await wrapper.get('.first-use-state li:nth-child(5) button').trigger('click')
    await vi.waitFor(() => expect(heldSearch.query).toEqual({ originId: 'haworth', departingAfter: '2026-10-09T11:30' }))
    // The search goes in the address bar, ready to share
    await vi.waitFor(() => expect(useRouter().currentRoute.value.query).toEqual({ from: 'haworth', date: '2026-10-09', time: '11:30' }))

    expect(wrapper.find('.loading-state').exists()).toBe(true)
    expect(wrapper.find('.first-use-state').exists()).toBe(false)
    expect(wrapper.find('.results-summary').text()).toBe('Searching for departures from Haworth…')

    heldSearch.answer()
    await vi.waitFor(() => expect(wrapper.find('.timetable-results table').exists()).toBe(true))

    expect(wrapper.find('.loading-state').exists()).toBe(false)
    expect(wrapper.find('.results-summary').text()).toBe('2 services found')

    wrapper.unmount()
  })

  it('runs the search in a shared link: loading from the start, then the results, with the form filled in', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 9, 11, 0))
    const heldSearch = holdTimetableSearch()
    const wrapper = await mountSuspended(IndexPage, { route: '/?from=haworth&date=2026-10-09&time=11:30' })

    expect(wrapper.find('.loading-state').exists()).toBe(true)
    expect(wrapper.find('.first-use-state').exists()).toBe(false)
    expect(wrapper.find('.results-summary').text()).toBe('Searching for departures from Haworth…')

    await vi.waitFor(() => expect(heldSearch.query).toEqual({ originId: 'haworth', departingAfter: '2026-10-09T11:30' }))

    expect(wrapper.findComponent(TimetableOriginSelect).props('modelValue')).toBe('haworth')

    heldSearch.answer()
    await vi.waitFor(() => expect(wrapper.find('.timetable-results table').exists()).toBe(true))

    expect(wrapper.find('.results-summary').text()).toBe('2 services found')

    wrapper.unmount()
  })

  it('refuses a stale link like the form does: its values with the error, the station cards, and no request', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 9, 11, 0))
    let isSearchRequested = false
    // Not `once`: it should never be called, and a leftover registration would answer the next test
    const unregisterTimetableEndpoint = registerEndpoint('/api/timetable/search', () => {
      isSearchRequested = true
      return timetableResponseFixture
    })
    const wrapper = await mountSuspended(IndexPage, { route: '/?from=haworth&date=2026-10-08&time=11:30' })

    await vi.waitFor(() => expect(wrapper.find('.first-use-state').exists()).toBe(true))

    expect(wrapper.find('.loading-state').exists()).toBe(false)
    expect(wrapper.find('.search-field-error').text()).toBe('Error: Choose today or a later date')
    expect(wrapper.find('.results-summary').text()).toBe('')
    expect(isSearchRequested).toBe(false)

    unregisterTimetableEndpoint()
    wrapper.unmount()
  })

  it('goes back to the station cards when the address bar goes back to /', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 9, 11, 0))
    const heldSearch = holdTimetableSearch()
    const wrapper = await mountSuspended(IndexPage, { route: '/?from=haworth&date=2026-10-09&time=11:30' })
    heldSearch.answer()
    await vi.waitFor(() => expect(wrapper.find('.timetable-results table').exists()).toBe(true))

    await useRouter().push('/')

    await vi.waitFor(() => expect(wrapper.find('.first-use-state').exists()).toBe(true))
    expect(wrapper.find('.timetable-results').exists()).toBe(false)
    expect(wrapper.find('.results-summary').text()).toBe('')

    wrapper.unmount()
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' })

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

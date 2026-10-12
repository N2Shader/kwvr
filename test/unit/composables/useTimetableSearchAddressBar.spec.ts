import { afterEach, describe, expect, it } from 'vitest'
import { useTimetableSearch } from '~/composables/useTimetableSearch'
import type { TimetableSearchCriteria } from '~/types/timetable'
import { keighleyFixture, searchCriteriaFixture } from '../../fixtures/timetableFixtures'
import { copySearchCriteria, holdTimetableRequests, releaseTimetableEndpoint, waitForHeldRequest } from '../../fixtures/heldTimetableRequests'

const keighleyCriteria: TimetableSearchCriteria = { origin: keighleyFixture, departingAfter: '2026-04-24T11:00' }

// A search from the address bar (a shared link): the page starts on it, and the form sends it once checked
describe('useTimetableSearch with a search from the address bar', () => {
  afterEach(releaseTimetableEndpoint)

  it('starts on checking-link, and sends nothing yet', () => {
    const heldRequests = holdTimetableRequests()
    const { searchState } = useTimetableSearch(searchCriteriaFixture)

    expect(searchState.value).toEqual({ status: 'checking-link', criteria: searchCriteriaFixture })
    expect(heldRequests).toHaveLength(0)
  })

  it('sends the linked search once the form passes it on (it isn\'t on screen yet)', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria } = useTimetableSearch(searchCriteriaFixture)

    const formCriteria = copySearchCriteria(searchCriteriaFixture)
    const searchDone = searchTimetableByCriteria(formCriteria)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)

    expect(heldRequest.query).toEqual({ originId: 'haworth', departingAfter: '2026-04-24T12:00' })
    expect(searchState.value).toEqual({ status: 'loading', criteria: formCriteria })

    heldRequest.answer()
    await searchDone

    expect(searchState.value.status).toBe('results')
  })

  it('tells whether a search is on screen: loading or shown, not a link still being checked', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchTimetableByCriteria, isSearchOnScreen } = useTimetableSearch(searchCriteriaFixture)

    expect(isSearchOnScreen(searchCriteriaFixture)).toBe(false)

    const searchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)

    expect(isSearchOnScreen(copySearchCriteria(searchCriteriaFixture))).toBe(true)
    expect(isSearchOnScreen(keighleyCriteria)).toBe(false)

    heldRequest.answer()
    await searchDone

    expect(isSearchOnScreen(copySearchCriteria(searchCriteriaFixture))).toBe(true)
  })

  it('goes to first use when reset (a link the form refused)', () => {
    const { searchState, resetTimetableSearch } = useTimetableSearch(searchCriteriaFixture)

    resetTimetableSearch()

    expect(searchState.value).toEqual({ status: 'first-use' })
  })
})

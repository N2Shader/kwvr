import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTimetableSearch } from '~/composables/useTimetableSearch'
import type { TimetableSearchCriteria } from '~/types/timetable'
import { getTrainServicesByCriteria } from '~/utils/timetableResponse'
import { keighleyFixture, searchCriteriaFixture, timetableResponseFixture } from '../../fixtures/timetableFixtures'
import { copySearchCriteria, holdTimetableRequests, releaseTimetableEndpoint, waitForHeldRequest } from '../../fixtures/heldTimetableRequests'

const keighleyCriteria: TimetableSearchCriteria = { origin: keighleyFixture, departingAfter: '2026-04-24T11:00' }

// A search from the address bar (the linked criteria) is covered by useTimetableSearchAddressBar.spec.ts
describe('useTimetableSearch', () => {
  afterEach(releaseTimetableEndpoint)

  it('starts on first use', () => {
    const { searchState } = useTimetableSearch()

    expect(searchState.value).toEqual({ status: 'first-use' })
  })

  it('shows the loading state with the criteria while the request is pending', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria } = useTimetableSearch()

    const searchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)

    expect(searchState.value).toEqual({ status: 'loading', criteria: searchCriteriaFixture })

    heldRequest.answer()
    await searchDone
  })

  it('sends the origin and the departure date-time to the endpoint', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchTimetableByCriteria } = useTimetableSearch()

    const searchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)

    expect(heldRequest.query).toEqual({ originId: 'haworth', departingAfter: '2026-04-24T12:00' })

    heldRequest.answer()
    await searchDone
  })

  it('shows the services from the searched station once the endpoint answers', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria } = useTimetableSearch()

    const searchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)
    heldRequest.answer()
    await searchDone

    expect(searchState.value).toEqual({
      status: 'results',
      criteria: searchCriteriaFixture,
      services: getTrainServicesByCriteria(timetableResponseFixture, searchCriteriaFixture),
    })
  })

  it('shows the no-results state when no train leaves after the searched time', async () => {
    const lateCriteria: TimetableSearchCriteria = { origin: keighleyFixture, departingAfter: '2026-04-24T17:00' }
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria } = useTimetableSearch()

    const searchDone = searchTimetableByCriteria(lateCriteria)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)
    heldRequest.answer()
    await searchDone

    expect(searchState.value).toEqual({ status: 'no-results', criteria: lateCriteria })
  })

  it('shows the error state when the request fails', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria } = useTimetableSearch()

    const searchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)
    heldRequest.fail()
    await searchDone

    expect(searchState.value).toEqual({ status: 'error', criteria: searchCriteriaFixture })
  })

  it('gives the request a 15s timeout, so a search that never answers ends in the error state', async () => {
    const fetchSpy = vi.spyOn(globalThis, '$fetch')
    const heldRequests = holdTimetableRequests()
    const { searchTimetableByCriteria } = useTimetableSearch()

    const searchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)

    expect(fetchSpy).toHaveBeenCalledWith('/api/timetable/search', expect.objectContaining({ timeout: 15_000 }))

    heldRequest.answer()
    await searchDone
    fetchSpy.mockRestore()
  })

  it('goes back to first use when reset after an error', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria, resetTimetableSearch } = useTimetableSearch()

    const searchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)
    heldRequest.fail()
    await searchDone

    resetTimetableSearch()

    expect(searchState.value).toEqual({ status: 'first-use' })
  })

  it('ignores a late answer from an earlier search', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria } = useTimetableSearch()

    const earlierSearchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const earlierRequest = await waitForHeldRequest(heldRequests, 0)
    const latestSearchDone = searchTimetableByCriteria(keighleyCriteria)
    const latestRequest = await waitForHeldRequest(heldRequests, 1)

    earlierRequest.answer()
    await earlierSearchDone

    expect(searchState.value).toEqual({ status: 'loading', criteria: keighleyCriteria })

    latestRequest.answer()
    await latestSearchDone

    expect(searchState.value).toEqual({
      status: 'results',
      criteria: keighleyCriteria,
      services: getTrainServicesByCriteria(timetableResponseFixture, keighleyCriteria),
    })
  })

  it('doesn\'t send the search on screen again', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria } = useTimetableSearch()

    const searchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)
    heldRequest.answer()
    await searchDone
    const resultsState = searchState.value

    // A repeat that went out would hang on the held endpoint, so this await only ends if it was skipped
    await searchTimetableByCriteria(copySearchCriteria(searchCriteriaFixture))

    expect(heldRequests).toHaveLength(1)
    expect(searchState.value).toBe(resultsState)
  })

  it('doesn\'t send the search still loading again', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria } = useTimetableSearch()

    const searchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const heldRequest = await waitForHeldRequest(heldRequests, 0)
    const loadingState = searchState.value

    await searchTimetableByCriteria(copySearchCriteria(searchCriteriaFixture))

    expect(heldRequests).toHaveLength(1)
    expect(searchState.value).toBe(loadingState)

    heldRequest.answer()
    await searchDone

    expect(searchState.value.status).toBe('results')
  })

  it('sends the same search again after an error, as the retry', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria } = useTimetableSearch()

    const failedSearchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const failedRequest = await waitForHeldRequest(heldRequests, 0)
    failedRequest.fail()
    await failedSearchDone

    const retryCriteria = copySearchCriteria(searchCriteriaFixture)
    const retryDone = searchTimetableByCriteria(retryCriteria)
    const retryRequest = await waitForHeldRequest(heldRequests, 1)

    expect(searchState.value).toEqual({ status: 'loading', criteria: retryCriteria })

    retryRequest.answer()
    await retryDone

    expect(searchState.value.status).toBe('results')
  })

  it('still searches the same station at a different time', async () => {
    const heldRequests = holdTimetableRequests()
    const { searchState, searchTimetableByCriteria } = useTimetableSearch()

    const firstSearchDone = searchTimetableByCriteria(searchCriteriaFixture)
    const firstRequest = await waitForHeldRequest(heldRequests, 0)
    firstRequest.answer()
    await firstSearchDone

    const laterCriteria: TimetableSearchCriteria = { origin: searchCriteriaFixture.origin, departingAfter: '2026-04-24T14:00' }
    const laterSearchDone = searchTimetableByCriteria(laterCriteria)
    const laterRequest = await waitForHeldRequest(heldRequests, 1)

    expect(laterRequest.query).toEqual({ originId: 'haworth', departingAfter: '2026-04-24T14:00' })
    expect(searchState.value).toEqual({ status: 'loading', criteria: laterCriteria })

    laterRequest.answer()
    await laterSearchDone
  })
})

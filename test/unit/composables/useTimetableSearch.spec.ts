import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { createError } from '#imports'
import { useTimetableSearch } from '~/composables/useTimetableSearch'
import type { TimetableSearchCriteria } from '~/types/timetable'
import type { TimetableApiResponse } from '~/types/timetableApi'
import { getTrainServicesByCriteria } from '~/utils/timetableResponse'
import { keighleyFixture, searchCriteriaFixture, timetableResponseFixture } from '../../fixtures/timetableFixtures'

const keighleyCriteria: TimetableSearchCriteria = { origin: keighleyFixture, departingAfter: '2026-04-24T11:00' }

// A request the mocked endpoint holds until the test answers it, so the state in between can be checked
interface HeldTimetableRequest {
  query: Record<string, string>
  answer: () => void
  fail: () => void
}

let unregisterTimetableEndpoint = () => {}

const holdTimetableRequests = () => {
  const heldRequests: HeldTimetableRequest[] = []
  unregisterTimetableEndpoint = registerEndpoint('/api/timetable/search', event => new Promise<TimetableApiResponse>((resolve, reject) => {
    heldRequests.push({
      query: Object.fromEntries(new URL(event.path, 'http://localhost').searchParams),
      answer: () => resolve(timetableResponseFixture),
      fail: () => reject(createError({ statusCode: 503, statusMessage: 'Timetable API unavailable' })),
    })
  }))
  return heldRequests
}

// Waits until the endpoint has received the request at `requestIndex` (0 is the first)
const waitForHeldRequest = async (heldRequests: HeldTimetableRequest[], requestIndex: number) => {
  await vi.waitFor(() => expect(heldRequests.length).toBeGreaterThan(requestIndex))
  return heldRequests[requestIndex] as HeldTimetableRequest
}

describe('useTimetableSearch', () => {
  // Unregistered once only: a second call would remove whichever registration is last
  afterEach(() => {
    unregisterTimetableEndpoint()
    unregisterTimetableEndpoint = () => {}
  })

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

  // The form builds new criteria on every submit, so a repeat is an equal copy, never the same object
  const copySearchCriteria = (criteria: TimetableSearchCriteria): TimetableSearchCriteria =>
    ({ origin: { ...criteria.origin }, departingAfter: criteria.departingAfter })

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

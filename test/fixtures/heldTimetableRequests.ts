import { expect, vi } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { createError } from '#imports'
import type { TimetableSearchCriteria } from '~/types/timetable'
import type { TimetableApiResponse } from '~/types/timetableApi'
import { timetableResponseFixture } from './timetableFixtures'

// Shared by the useTimetableSearch specs

// A request the mocked endpoint holds until the test answers it, so the state in between can be checked
export interface HeldTimetableRequest {
  query: Record<string, string>
  answer: () => void
  fail: () => void
}

let unregisterTimetableEndpoint = () => {}

export const holdTimetableRequests = () => {
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

// For afterEach. Unregistered once only: a second call would remove whichever registration is last
export const releaseTimetableEndpoint = () => {
  unregisterTimetableEndpoint()
  unregisterTimetableEndpoint = () => {}
}

// Waits until the endpoint has received the request at `requestIndex` (0 is the first)
export const waitForHeldRequest = async (heldRequests: HeldTimetableRequest[], requestIndex: number) => {
  await vi.waitFor(() => expect(heldRequests.length).toBeGreaterThan(requestIndex))
  return heldRequests[requestIndex] as HeldTimetableRequest
}

// The form builds new criteria on every submit, so a repeat is an equal copy, never the same object
export const copySearchCriteria = (criteria: TimetableSearchCriteria): TimetableSearchCriteria =>
  ({ origin: { ...criteria.origin }, departingAfter: criteria.departingAfter })

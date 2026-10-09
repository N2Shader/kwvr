import type { Ref } from 'vue'
import { getLocalTimeZone, now } from '@internationalized/date'
import type { CalendarDate, Time, ZonedDateTime } from '@internationalized/date'

/*
 * Keeps the departure time from going earlier than "now" when the date is today, as the calendar does for days.
 *
 * The time field writes its model after every keystroke (typing "15" at 14:30 first writes 01:30),
 * so the time can't be clamped on each change. It's clamped when the user is done instead: when focus
 * leaves the time field, and when a date is picked. Until then an earlier time shows as invalid.
 *
 * Going to Search never clamps it: a search with an earlier time is refused with an error instead
 * (see getSearchFormErrorsByValues), so the user doesn't search for a time they didn't choose.
 */
export const useDepartureTimeLimit = (departingDate: Ref<CalendarDate | undefined>, departingTime: Ref<Time | undefined>) => {
  // Read from the user's clock on the client only (the server's clock and time zone would break hydration)
  const departureClock = shallowRef<ZonedDateTime>()
  // Read by a polite live region, so screen reader users hear when their time was moved
  const departingTimeNotice = ref('')

  const refreshDepartureClock = () => {
    departureClock.value = now(getLocalTimeZone())
  }

  const earliestDepartingTime = computed(() => {
    if (!departingDate.value || !departureClock.value) return undefined
    return getEarliestDepartureTimeByDate(departingDate.value, departureClock.value)
  })

  const moveDepartingTimeToEarliest = () => {
    const earliestTime = earliestDepartingTime.value

    if (!earliestTime || !departingTime.value || departingTime.value.compare(earliestTime) >= 0) {
      // Cleared, so the same notice is announced again the next time the time is moved
      departingTimeNotice.value = ''
      return
    }

    departingTime.value = earliestTime
    departingTimeNotice.value = `Time moved to ${formatTimeOfDay(earliestTime)}, the earliest departure today`
  }

  // Paused while the user heads for Search: a click moves focus (and fires the blur) before the submit,
  // and on touch screens only after the finger lifts, so the pause lasts until the search or the next edit
  let isDepartingTimeCommitPaused = false

  const pauseDepartingTimeCommit = () => {
    isDepartingTimeCommitPaused = true
  }

  const resumeDepartingTimeCommit = () => {
    isDepartingTimeCommitPaused = false
  }

  /** Focus left the time field: clamp it, unless the user is going to Search (by pointer or by Tab) */
  const commitDepartingTime = (focusEvent?: FocusEvent) => {
    const isLeavingForSearch = focusEvent?.relatedTarget instanceof HTMLElement && focusEvent.relatedTarget.matches('[type="submit"]')
    if (isDepartingTimeCommitPaused || isLeavingForSearch) return
    moveDepartingTimeToEarliest()
  }

  // Picking a date is a single action, so the time can be clamped straight away
  watch(departingDate, (selectedDate) => {
    if (!selectedDate) return
    refreshDepartureClock()
    moveDepartingTimeToEarliest()
  })

  return {
    departureClock,
    departingTimeNotice,
    earliestDepartingTime,
    refreshDepartureClock,
    commitDepartingTime,
    pauseDepartingTimeCommit,
    resumeDepartingTimeCommit,
  }
}

import { Time, getLocalTimeZone, now, toCalendarDate } from '@internationalized/date'
import type { CalendarDate, ZonedDateTime } from '@internationalized/date'

// Prefill rules for the search form, read from the user's own clock (never the server's).

/** From this local hour the day's services are over, so the search starts on the next day */
export const NEXT_DAY_FROM_HOUR = 20

export interface DepartureDefaults {
  /** Earliest date the calendar allows (today) */
  earliestDate: CalendarDate
  date: CalendarDate
  time: Time
}

/**
 * Before 20:00 → today, departing from the current time.
 * From 20:00 → tomorrow, from the start of the day (so every service shows).
 */
export const getDepartureDefaultsByClock = (currentDateTime: ZonedDateTime = now(getLocalTimeZone())): DepartureDefaults => {
  const todayDate = toCalendarDate(currentDateTime)

  if (currentDateTime.hour >= NEXT_DAY_FROM_HOUR) {
    return { earliestDate: todayDate, date: todayDate.add({ days: 1 }), time: new Time(0, 0) }
  }

  return { earliestDate: todayDate, date: todayDate, time: new Time(currentDateTime.hour, currentDateTime.minute) }
}

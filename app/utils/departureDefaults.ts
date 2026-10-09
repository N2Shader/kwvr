import { Time, getLocalTimeZone, now, toCalendarDate } from '@internationalized/date'
import type { CalendarDate, ZonedDateTime } from '@internationalized/date'

// Prefill rules for the search form, read from the user's own clock (never the server's).

// Trains normally run from 10:00 to 18:00; the prefill allows an hour either side of that
/** The prefilled time is never earlier than this (an hour before the first train) */
export const FIRST_DEFAULT_DEPARTURE_HOUR = 9
/** From this local hour (an hour after the last train) the day's services are over, so the search starts on the next day */
export const NEXT_DAY_FROM_HOUR = 19

export interface DepartureDefaults {
  /** Earliest date the calendar allows (today) */
  earliestDate: CalendarDate
  date: CalendarDate
  time: Time
}

/**
 * Before 09:00 → today at 09:00.
 * 09:00 to 18:59 → today, departing from the current time.
 * From 19:00 → tomorrow at 09:00.
 */
export const getDepartureDefaultsByClock = (currentDateTime: ZonedDateTime = now(getLocalTimeZone())): DepartureDefaults => {
  const todayDate = toCalendarDate(currentDateTime)
  const firstDefaultTime = new Time(FIRST_DEFAULT_DEPARTURE_HOUR, 0)

  if (currentDateTime.hour >= NEXT_DAY_FROM_HOUR) {
    return { earliestDate: todayDate, date: todayDate.add({ days: 1 }), time: firstDefaultTime }
  }

  if (currentDateTime.hour < FIRST_DEFAULT_DEPARTURE_HOUR) {
    return { earliestDate: todayDate, date: todayDate, time: firstDefaultTime }
  }

  return { earliestDate: todayDate, date: todayDate, time: new Time(currentDateTime.hour, currentDateTime.minute) }
}

/** On today (or a stale earlier date), departures before the current minute are gone; other days have no limit */
export const getEarliestDepartureTimeByDate = (departureDate: CalendarDate, currentDateTime: ZonedDateTime = now(getLocalTimeZone())): Time | undefined =>
  departureDate.compare(toCalendarDate(currentDateTime)) <= 0 ? new Time(currentDateTime.hour, currentDateTime.minute) : undefined

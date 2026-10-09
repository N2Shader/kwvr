import type { CalendarDate, Time } from '@internationalized/date'
import type { TimetableSearchFormErrors, TimetableSearchFormValues } from '~/types/timetable'
import { formatTimeOfDay } from '~/utils/timetableFormatting'

// Short, explicit messages that name the field to fix

export interface SearchFormLimits {
  /** Today on the user's clock (never the server's) */
  todayDate: CalendarDate
  /** Set when the chosen date is today: departures before it have gone (see getEarliestDepartureTimeByDate) */
  earliestTime?: Time
}

export const getSearchFormErrorsByValues = (searchFormValues: TimetableSearchFormValues, { todayDate, earliestTime }: SearchFormLimits): TimetableSearchFormErrors => {
  const searchFormErrors: TimetableSearchFormErrors = {}

  if (!searchFormValues.originId) {
    searchFormErrors.originId = 'Select a station to depart from'
  }

  if (!searchFormValues.departingDate) {
    searchFormErrors.departingDate = 'Select a departure date'
  }
  else if (searchFormValues.departingDate.compare(todayDate) < 0) {
    // The page was left open overnight, so the chosen day has gone
    searchFormErrors.departingDate = 'Choose today or a later date'
  }

  if (!searchFormValues.departingTime) {
    searchFormErrors.departingTime = 'Enter a departure time (hours and minutes)'
  }
  else if (earliestTime && searchFormValues.departingTime.compare(earliestTime) < 0) {
    searchFormErrors.departingTime = `Choose a time from ${formatTimeOfDay(earliestTime)} onwards`
  }

  return searchFormErrors
}

import { describe, expect, it } from 'vitest'
import { CalendarDate, Time } from '@internationalized/date'
import { getSearchFormErrorsByValues } from '~/utils/searchFormValidation'

const todayDate = new CalendarDate(2026, 10, 9)

describe('getSearchFormErrorsByValues', () => {
  it('has no errors when every field is filled in', () => {
    expect(getSearchFormErrorsByValues({ originId: 'haworth', departingDate: todayDate, departingTime: new Time(14, 30) }, { todayDate })).toEqual({})
  })

  it('names every missing field', () => {
    expect(getSearchFormErrorsByValues({}, { todayDate })).toEqual({
      originId: 'Select a station to depart from',
      departingDate: 'Select a departure date',
      departingTime: 'Enter a departure time (hours and minutes)',
    })
  })

  it('rejects a date that has gone (the page was left open overnight)', () => {
    const searchFormErrors = getSearchFormErrorsByValues({ originId: 'haworth', departingDate: new CalendarDate(2026, 10, 8), departingTime: new Time(9, 0) }, { todayDate })

    expect(searchFormErrors).toEqual({ departingDate: 'Choose today or a later date' })
  })

  it('allows a later date', () => {
    expect(getSearchFormErrorsByValues({ originId: 'haworth', departingDate: new CalendarDate(2026, 10, 10), departingTime: new Time(9, 0) }, { todayDate })).toEqual({})
  })

  it('refuses a time already gone today, naming the earliest time allowed', () => {
    const searchFormErrors = getSearchFormErrorsByValues(
      { originId: 'haworth', departingDate: todayDate, departingTime: new Time(9, 0) },
      { todayDate, earliestTime: new Time(14, 30) },
    )

    expect(searchFormErrors).toEqual({ departingTime: 'Choose a time from 14:30 onwards' })
  })

  it('allows the earliest time itself', () => {
    const searchFormErrors = getSearchFormErrorsByValues(
      { originId: 'haworth', departingDate: todayDate, departingTime: new Time(14, 30) },
      { todayDate, earliestTime: new Time(14, 30) },
    )

    expect(searchFormErrors).toEqual({})
  })
})

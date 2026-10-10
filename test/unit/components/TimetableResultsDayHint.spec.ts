import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableResultsDayHint from '~/components/timetable/TimetableResultsDayHint.vue'

const mountDayHint = (departingAfter: string) => mountSuspended(TimetableResultsDayHint, { props: { departingAfter } })

describe('TimetableResultsDayHint', () => {
  // The user's clock reads 24 April 2026, 10:00 local time (only Date is faked, so the mount's timers still run)
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 3, 24, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('says nothing for a search on today', async () => {
    const wrapper = await mountDayHint('2026-04-24T12:00')

    expect(wrapper.find('.results-day-hint').exists()).toBe(false)
  })

  it('warns, after an asterisk, when the search is for another day', async () => {
    const wrapper = await mountDayHint('2026-04-25T09:00')
    const dayHint = wrapper.find('.results-day-hint')

    expect(dayHint.text()).toBe('* These trains are not for today')
  })

  it('hides the asterisk from assistive tech', async () => {
    const wrapper = await mountDayHint('2026-04-25T09:00')

    expect(wrapper.find('.results-day-hint [aria-hidden="true"]').text()).toBe('*')
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountDayHint('2026-04-25T09:00')

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

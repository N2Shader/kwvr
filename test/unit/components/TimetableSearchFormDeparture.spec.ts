import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import { Time } from '@internationalized/date'
import type { VueWrapper } from '@vue/test-utils'
import TimetableSearchForm from '~/components/timetable/TimetableSearchForm.vue'
import TimetableDepartureTimeField from '~/components/timetable/TimetableDepartureTimeField.vue'
import { stationsFixture } from '../../fixtures/timetableFixtures'

// The date and time prefill read the user's clock, so each test pins it (local time, Friday 9 October 2026)
const mountSearchFormAt = async (localDateTime: Date) => {
  vi.setSystemTime(localDateTime)
  // Attached to the document because the calendar is portalled to <body>
  const wrapper = await mountSuspended(TimetableSearchForm, {
    props: { stations: stationsFixture, defaultCriteria: {} },
    attachTo: document.body,
  })
  await nextTick()
  return wrapper
}

// Sets the time the way the field does while the user is still typing (the model changes, focus stays)
const typeDepartingTime = async (wrapper: VueWrapper, hour: number, minute: number) => {
  wrapper.findComponent(TimetableDepartureTimeField).vm.$emit('update:modelValue', new Time(hour, minute))
  await nextTick()
}

// Focus leaves the hour and minute group altogether (no related target inside it)
const leaveTimeField = async (wrapper: VueWrapper) => {
  await wrapper.find('.search-time-field').trigger('focusout')
}

const pickDepartingDate = async (wrapper: VueWrapper, isoDate: string) => {
  await wrapper.find('button[aria-haspopup="dialog"]').trigger('click')
  await nextTick()
  document.body.querySelector<HTMLElement>(`[data-value="${isoDate}"]`)?.click()
  await nextTick()
  await nextTick()
}

describe('TimetableSearchForm departure date and time', () => {
  beforeEach(() => {
    // Only Date is faked, so the popover's own timers keep running
    vi.useFakeTimers({ toFake: ['Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('starts on today and the current time during the day', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 14, 30))
    const dateTrigger = wrapper.find('button[aria-haspopup="dialog"]')

    expect(dateTrigger.text()).toContain('9 Oct 2026')
    expect((wrapper.find('input[name="departingDate"]').element as HTMLInputElement).value).toBe('2026-10-09')
    expect(wrapper.find('[data-segment="hour"]').text()).toBe('14')
    expect(wrapper.find('[data-segment="minute"]').text()).toBe('30')

    wrapper.unmount()
  })

  it('starts on today at 09:00 before 09:00', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 7, 15))
    const dateTrigger = wrapper.find('button[aria-haspopup="dialog"]')

    expect(dateTrigger.text()).toContain('9 Oct 2026')
    expect(wrapper.find('[data-segment="hour"]').text()).toBe('09')
    expect(wrapper.find('[data-segment="minute"]').text()).toBe('00')

    wrapper.unmount()
  })

  it('starts on tomorrow at 09:00 from 19:00', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 19, 0))
    const dateTrigger = wrapper.find('button[aria-haspopup="dialog"]')

    expect(dateTrigger.text()).toContain('10 Oct 2026')
    expect(wrapper.find('[data-segment="hour"]').text()).toBe('09')
    expect(wrapper.find('[data-segment="minute"]').text()).toBe('00')

    wrapper.unmount()
  })

  it('names the date trigger with its label and the chosen date', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 14, 30))
    const dateTrigger = wrapper.find('button[aria-haspopup="dialog"]')
    const [dateLabelId, dateValueId] = (dateTrigger.attributes('aria-labelledby') ?? '').split(' ')

    expect(wrapper.find(`[id="${dateLabelId}"]`).text()).toBe('Date')
    expect(wrapper.find(`[id="${dateValueId}"]`).text()).toContain('9 Oct 2026')

    wrapper.unmount()
  })

  it('opens a calendar where days before today cannot be picked', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 14, 30))
    const dateTrigger = wrapper.find('button[aria-haspopup="dialog"]')

    await dateTrigger.trigger('click')
    await nextTick()

    expect(dateTrigger.attributes('aria-expanded')).toBe('true')
    expect(document.body.querySelector('[data-value="2026-10-08"]')?.getAttribute('aria-disabled')).toBe('true')
    expect(document.body.querySelector('[data-value="2026-10-09"]')?.hasAttribute('aria-disabled')).toBe(false)

    wrapper.unmount()
  })

  it('names the time field with its visible label', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 14, 30))
    const timeField = wrapper.find('.search-time-field')

    expect(timeField.attributes('role')).toBe('group')
    expect(wrapper.find(`[id="${timeField.attributes('aria-labelledby')}"]`).text()).toBe('Time')

    wrapper.unmount()
  })

  it('has no detectable accessibility violations once prefilled', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 14, 30))

    expect(await axe(wrapper.html())).toHaveNoViolations()

    wrapper.unmount()
  })

  it('shows a time already gone today as invalid while it is being edited', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 14, 30))

    await wrapper.find('[data-segment="hour"]').trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.find('[data-segment="hour"]').text()).toBe('13')
    expect(wrapper.find('.search-time-field').attributes('data-invalid')).toBeDefined()

    wrapper.unmount()
  })

  it('moves a time already gone today to now when focus leaves the field, and announces it', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 14, 30))

    await typeDepartingTime(wrapper, 9, 0)
    await leaveTimeField(wrapper)

    expect(wrapper.find('[data-segment="hour"]').text()).toBe('14')
    expect(wrapper.find('[data-segment="minute"]').text()).toBe('30')
    expect(wrapper.find('.search-time-field').attributes('data-invalid')).toBeUndefined()
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('Time moved to 14:30, the earliest departure today')

    wrapper.unmount()
  })

  it('allows any time on tomorrow', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 14, 30))

    await pickDepartingDate(wrapper, '2026-10-10')
    await typeDepartingTime(wrapper, 8, 0)
    await leaveTimeField(wrapper)

    expect(wrapper.find('[data-segment="hour"]').text()).toBe('08')
    expect(wrapper.find('.search-time-field').attributes('data-invalid')).toBeUndefined()
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('')

    wrapper.unmount()
  })

  it('moves the time to now when the date changes back to today', async () => {
    const wrapper = await mountSearchFormAt(new Date(2026, 9, 9, 14, 30))

    await pickDepartingDate(wrapper, '2026-10-10')
    await typeDepartingTime(wrapper, 8, 0)
    await pickDepartingDate(wrapper, '2026-10-09')

    expect(wrapper.find('[data-segment="hour"]').text()).toBe('14')
    expect(wrapper.find('[data-segment="minute"]').text()).toBe('30')

    wrapper.unmount()
  })
})

import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { axe } from 'vitest-axe'
import TimetableSearchForm from '~/components/timetable/TimetableSearchForm.vue'
import TimetableOriginSelect from '~/components/timetable/TimetableOriginSelect.vue'
import { haworthFixture, stationsFixture } from '../../fixtures/timetableFixtures'

// Clock pinned to Friday 9 October 2026, 14:30 local time, so the prefill is today at 14:30
const mountSearchForm = async () => {
  vi.setSystemTime(new Date(2026, 9, 9, 14, 30))
  // Attached to the document so focus can move
  const wrapper = await mountSuspended(TimetableSearchForm, {
    props: { stations: stationsFixture, defaultCriteria: {} },
    attachTo: document.body,
  })
  await nextTick()
  return wrapper
}

const findErrorTextById = (wrapper: VueWrapper, errorId?: string) => wrapper.find(`[id="${errorId}"]`).text()

// The same call the page makes for a search in the address bar (a shared link, Back/Forward)
describe('TimetableSearchForm search from the address bar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('fills in the station, date and time, searches, and says it did', async () => {
    const wrapper = await mountSearchForm()

    const isSearchSent = await wrapper.vm.searchFromAddressBar({ origin: haworthFixture, departingAfter: '2026-10-12T16:45' })
    await flushPromises()

    expect(isSearchSent).toBe(true)
    expect(wrapper.findComponent(TimetableOriginSelect).props('modelValue')).toBe('haworth')
    expect(wrapper.find('button[aria-haspopup="dialog"]').text()).toContain('12 Oct 2026')
    expect(wrapper.find('[data-segment="hour"]').text()).toBe('16')
    expect(wrapper.find('[data-segment="minute"]').text()).toBe('45')
    expect(wrapper.emitted('search')).toEqual([[{ origin: haworthFixture, departingAfter: '2026-10-12T16:45' }]])

    wrapper.unmount()
  })

  it('refuses a day already gone with the date error, and moves focus to the date', async () => {
    const wrapper = await mountSearchForm()

    const isSearchSent = await wrapper.vm.searchFromAddressBar({ origin: haworthFixture, departingAfter: '2026-10-08T16:00' })
    await flushPromises()
    const dateTrigger = wrapper.find('button[aria-haspopup="dialog"]')

    expect(isSearchSent).toBe(false)
    expect(wrapper.emitted('search')).toBeUndefined()
    expect(dateTrigger.text()).toContain('8 Oct 2026')
    expect(findErrorTextById(wrapper, dateTrigger.attributes('aria-describedby'))).toBe('Error: Choose today or a later date')
    expect(document.activeElement).toBe(dateTrigger.element)

    wrapper.unmount()
  })

  it('refuses a time already gone today with the time error, without moving it', async () => {
    const wrapper = await mountSearchForm()

    const isSearchSent = await wrapper.vm.searchFromAddressBar({ origin: haworthFixture, departingAfter: '2026-10-09T11:00' })
    await flushPromises()
    const timeField = wrapper.find('.search-time-field')

    expect(isSearchSent).toBe(false)
    expect(wrapper.emitted('search')).toBeUndefined()
    expect(wrapper.find('[data-segment="hour"]').text()).toBe('11')
    expect(wrapper.find('[data-segment="minute"]').text()).toBe('00')
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('')
    expect(findErrorTextById(wrapper, timeField.attributes('aria-describedby'))).toBe('Error: Choose a time from 14:30 onwards')
    expect(document.activeElement).toBe(wrapper.find('[data-segment="hour"]').element)

    wrapper.unmount()
  })

  it('has no detectable accessibility violations after refusing a link', async () => {
    const wrapper = await mountSearchForm()

    await wrapper.vm.searchFromAddressBar({ origin: haworthFixture, departingAfter: '2026-10-08T16:00' })
    await flushPromises()

    expect(await axe(wrapper.html())).toHaveNoViolations()

    wrapper.unmount()
  })
})

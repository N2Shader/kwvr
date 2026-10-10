import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { Time } from '@internationalized/date'
import TimetableSearchForm from '~/components/timetable/TimetableSearchForm.vue'
import TimetableDepartureTimeField from '~/components/timetable/TimetableDepartureTimeField.vue'
import TimetableOriginSelect from '~/components/timetable/TimetableOriginSelect.vue'
import { haworthFixture, keighleyFixture, stationsFixture } from '../../fixtures/timetableFixtures'

// Clock pinned to Friday 9 October 2026, 14:30 local time, so the prefill is today at 14:30
const mountSearchForm = async () => {
  vi.setSystemTime(new Date(2026, 9, 9, 14, 30))
  // Attached to the document so the form can submit itself
  const wrapper = await mountSuspended(TimetableSearchForm, {
    props: { stations: stationsFixture, defaultCriteria: {} },
    attachTo: document.body,
  })
  await nextTick()
  return wrapper
}

// The same call the page makes when a station card under the search box is chosen
describe('TimetableSearchForm next train from a station', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('fills in the station and searches from now', async () => {
    const wrapper = await mountSearchForm()

    wrapper.vm.searchNextTrainFromStation(haworthFixture)
    await flushPromises()

    expect(wrapper.findComponent(TimetableOriginSelect).props('modelValue')).toBe('haworth')
    expect(wrapper.emitted('search')).toEqual([[{ origin: haworthFixture, departingAfter: '2026-10-09T14:30' }]])

    wrapper.unmount()
  })

  it('replaces a station and time the user had chosen', async () => {
    const wrapper = await mountSearchForm()
    wrapper.findComponent(TimetableOriginSelect).vm.$emit('update:modelValue', 'oxenhope')
    wrapper.findComponent(TimetableDepartureTimeField).vm.$emit('update:modelValue', new Time(16, 0))
    await nextTick()

    wrapper.vm.searchNextTrainFromStation(keighleyFixture)
    await flushPromises()

    expect(wrapper.emitted('search')).toEqual([[{ origin: keighleyFixture, departingAfter: '2026-10-09T14:30' }]])

    wrapper.unmount()
  })

  it('searches from tomorrow at 09:00 once the day\'s trains are over', async () => {
    const wrapper = await mountSearchForm()
    vi.setSystemTime(new Date(2026, 9, 9, 20, 0))

    wrapper.vm.searchNextTrainFromStation(haworthFixture)
    await flushPromises()

    expect(wrapper.emitted('search')).toEqual([[{ origin: haworthFixture, departingAfter: '2026-10-10T09:00' }]])

    wrapper.unmount()
  })
})

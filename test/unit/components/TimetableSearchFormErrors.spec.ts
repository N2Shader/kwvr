import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { axe } from 'vitest-axe'
import { Time } from '@internationalized/date'
import TimetableSearchForm from '~/components/timetable/TimetableSearchForm.vue'
import TimetableDepartureTimeField from '~/components/timetable/TimetableDepartureTimeField.vue'
import TimetableOriginSelect from '~/components/timetable/TimetableOriginSelect.vue'
import type { TimetableSearchDefaults } from '~/types/timetable'
import { haworthFixture, stationsFixture } from '../../fixtures/timetableFixtures'

// Clock pinned to Friday 9 October 2026, 14:30 local time, so the prefill is today at 14:30
const mountSearchFormWith = async (defaultCriteria: TimetableSearchDefaults) => {
  vi.setSystemTime(new Date(2026, 9, 9, 14, 30))
  // Attached to the document so focus can move
  const wrapper = await mountSuspended(TimetableSearchForm, {
    props: { stations: stationsFixture, defaultCriteria },
    attachTo: document.body,
  })
  await nextTick()
  return wrapper
}

const submitSearchForm = async (wrapper: VueWrapper) => {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

// The field writes an empty model when a segment is cleared (e.g. Backspace on the hour)
const clearDepartingTime = async (wrapper: VueWrapper) => {
  wrapper.findComponent(TimetableDepartureTimeField).vm.$emit('update:modelValue', undefined)
  await nextTick()
}

// Sets the time the way the field does while the user is still typing (the model changes, focus stays)
const typeDepartingTime = async (wrapper: VueWrapper, hour: number, minute: number) => {
  wrapper.findComponent(TimetableDepartureTimeField).vm.$emit('update:modelValue', new Time(hour, minute))
  await nextTick()
}

const findErrorTextById = (wrapper: VueWrapper, errorId?: string) => wrapper.find(`[id="${errorId}"]`).text()

describe('TimetableSearchForm search and errors', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('shows no errors before a search is tried', async () => {
    const wrapper = await mountSearchFormWith({})

    expect(wrapper.find('.search-field-error').exists()).toBe(false)
    expect(wrapper.find('[role="combobox"]').attributes('aria-invalid')).toBeUndefined()

    wrapper.unmount()
  })

  it('explains a missing station under its field, ties it to the combobox and moves focus there', async () => {
    const wrapper = await mountSearchFormWith({})

    await submitSearchForm(wrapper)
    const originCombobox = wrapper.find('[role="combobox"]')

    expect(consoleLogSpy).not.toHaveBeenCalled()
    expect(originCombobox.attributes('aria-invalid')).toBe('true')
    expect(findErrorTextById(wrapper, originCombobox.attributes('aria-describedby'))).toBe('Error: Select a station to depart from')
    expect(document.activeElement).toBe(originCombobox.element)

    wrapper.unmount()
  })

  it('removes the station error as soon as a station is chosen', async () => {
    const wrapper = await mountSearchFormWith({})

    await submitSearchForm(wrapper)
    wrapper.findComponent(TimetableOriginSelect).vm.$emit('update:modelValue', haworthFixture.id)
    await nextTick()

    expect(wrapper.find('.search-field-error').exists()).toBe(false)
    expect(wrapper.find('[role="combobox"]').attributes('aria-describedby')).toBeUndefined()

    wrapper.unmount()
  })

  it('explains a missing time under its field and moves focus to the hour', async () => {
    const wrapper = await mountSearchFormWith({ origin: haworthFixture })

    await clearDepartingTime(wrapper)
    await submitSearchForm(wrapper)
    const timeField = wrapper.find('.search-time-field')

    expect(consoleLogSpy).not.toHaveBeenCalled()
    expect(findErrorTextById(wrapper, timeField.attributes('aria-describedby'))).toBe('Error: Enter a departure time (hours and minutes)')
    expect(document.activeElement).toBe(wrapper.find('[data-segment="hour"]').element)

    wrapper.unmount()
  })

  it('searches when Enter is pressed in the time field', async () => {
    const wrapper = await mountSearchFormWith({ origin: haworthFixture })

    await wrapper.find('[data-segment="minute"]').trigger('keydown', { key: 'Enter' })
    await flushPromises()

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledWith('Search train times', { originId: 'haworth', departingDate: '2026-10-09', departingTime: '14:30:00' })

    wrapper.unmount()
  })

  it('refuses a time already gone today when Enter is pressed, without moving it', async () => {
    const wrapper = await mountSearchFormWith({ origin: haworthFixture })

    await typeDepartingTime(wrapper, 9, 0)
    await wrapper.find('[data-segment="minute"]').trigger('keydown', { key: 'Enter' })
    await flushPromises()
    const timeField = wrapper.find('.search-time-field')

    expect(consoleLogSpy).not.toHaveBeenCalled()
    expect(wrapper.find('[data-segment="hour"]').text()).toBe('09')
    expect(findErrorTextById(wrapper, timeField.attributes('aria-describedby'))).toBe('Error: Choose a time from 14:30 onwards')

    wrapper.unmount()
  })

  it('keeps a time already gone today when focus leaves for Search, then refuses the search', async () => {
    const wrapper = await mountSearchFormWith({ origin: haworthFixture })
    const searchButton = wrapper.find('button[type="submit"]')

    await typeDepartingTime(wrapper, 9, 0)
    await searchButton.trigger('pointerdown')
    await wrapper.find('.search-time-field').trigger('focusout', { relatedTarget: searchButton.element })
    await searchButton.trigger('click')
    await flushPromises()

    expect(consoleLogSpy).not.toHaveBeenCalled()
    expect(wrapper.find('[data-segment="hour"]').text()).toBe('09')
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('')
    expect(wrapper.find('.search-field-error').text()).toBe('Error: Choose a time from 14:30 onwards')

    wrapper.unmount()
  })

  it('removes the time error once a time from now onwards is chosen, then searches', async () => {
    const wrapper = await mountSearchFormWith({ origin: haworthFixture })

    await typeDepartingTime(wrapper, 9, 0)
    await submitSearchForm(wrapper)
    await typeDepartingTime(wrapper, 15, 0)

    expect(wrapper.find('.search-field-error').exists()).toBe(false)

    await submitSearchForm(wrapper)

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledWith('Search train times', expect.objectContaining({ departingTime: '15:00:00' }))

    wrapper.unmount()
  })

  it('has no detectable accessibility violations while showing errors', async () => {
    const wrapper = await mountSearchFormWith({})

    await clearDepartingTime(wrapper)
    await submitSearchForm(wrapper)

    expect(wrapper.findAll('.search-field-error')).toHaveLength(2)
    expect(await axe(wrapper.html())).toHaveNoViolations()

    wrapper.unmount()
  })
})

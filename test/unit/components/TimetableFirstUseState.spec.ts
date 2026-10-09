import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableFirstUseState from '~/components/timetable/TimetableFirstUseState.vue'
import { stationHighlights } from '~/data/stationHighlights'

const mountFirstUseState = () => mountSuspended(TimetableFirstUseState, { props: { stationHighlights } })

describe('TimetableFirstUseState', () => {
  it('offers the next train from each station, under a heading that labels the section', async () => {
    const wrapper = await mountFirstUseState()

    const heading = wrapper.find('h2')
    expect(heading.text()).toBe('Or catch the next train from…')
    expect(wrapper.find('section').attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(wrapper.findAll('section li button')).toHaveLength(stationHighlights.length)
  })

  it('passes the chosen station on', async () => {
    const wrapper = await mountFirstUseState()

    await wrapper.get('li:first-child button').trigger('click')

    expect(wrapper.emitted('select-station')).toEqual([[{ id: 'keighley', name: 'Keighley' }]])
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountFirstUseState()

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

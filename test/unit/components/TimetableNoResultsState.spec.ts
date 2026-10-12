import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableNoResultsState from '~/components/timetable/TimetableNoResultsState.vue'

const mountNoResultsState = () => mountSuspended(TimetableNoResultsState)

describe('TimetableNoResultsState', () => {
  it('says no trains run at that time, under a heading that labels the section', async () => {
    const wrapper = await mountNoResultsState()

    const heading = wrapper.get('.no-results-state h2')
    expect(heading.text()).toBe('Sorry, there are no trains at that time')
    expect(wrapper.get('.no-results-state').attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(wrapper.get('.no-results-state .illustrated-state-message').text())
      .toContain('please try another date or an earlier time.')
  })

  it('shows the illustration as decoration, in resized copies', async () => {
    const wrapper = await mountNoResultsState()

    const illustration = wrapper.get('.no-results-state img')
    expect(illustration.attributes('alt')).toBe('')
    expect(illustration.attributes('srcset')).toContain('station-clock.webp')
    expect(illustration.attributes('width')).toBe('960')
    expect(illustration.attributes('height')).toBe('640')
    expect(illustration.attributes('loading')).toBe('lazy')
  })

  it('asks to go home when the button is pressed', async () => {
    const wrapper = await mountNoResultsState()

    const homeButton = wrapper.get('.no-results-state button')
    expect(homeButton.text()).toBe('Take me home please')

    await homeButton.trigger('click')

    expect(wrapper.emitted('return-home')).toHaveLength(1)
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountNoResultsState()

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

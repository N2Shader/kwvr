import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableErrorState from '~/components/timetable/TimetableErrorState.vue'

const mountErrorState = () => mountSuspended(TimetableErrorState)

describe('TimetableErrorState', () => {
  it('says the timetable could not be loaded, under a heading that labels the section', async () => {
    const wrapper = await mountErrorState()

    const heading = wrapper.get('.error-state h2')
    expect(heading.text()).toBe('Sorry, we couldn’t load the timetable')
    expect(wrapper.get('.error-state').attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(wrapper.get('.error-state .error-state-message').text()).toContain('Please try again in a moment.')
  })

  it('shows the illustration as decoration, in resized copies', async () => {
    const wrapper = await mountErrorState()

    const illustration = wrapper.get('.error-state img')
    expect(illustration.attributes('alt')).toBe('')
    expect(illustration.attributes('srcset')).toContain('derailed-train.webp')
    expect(illustration.attributes('loading')).toBe('lazy')
  })

  it('asks to go home when the button is pressed', async () => {
    const wrapper = await mountErrorState()

    const homeButton = wrapper.get('.error-state button')
    expect(homeButton.text()).toBe('Take me home please')

    await homeButton.trigger('click')

    expect(wrapper.emitted('return-home')).toHaveLength(1)
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountErrorState()

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

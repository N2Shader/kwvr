import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import App from '~/app.vue'

describe('App', () => {
  it('renders a skip link that targets the main landmark', async () => {
    const wrapper = await mountSuspended(App, { route: '/' })

    expect(wrapper.find('a[href="#main"]').exists()).toBe(true)
    expect(wrapper.find('main#main').exists()).toBe(true)
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSuspended(App, { route: '/' })

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

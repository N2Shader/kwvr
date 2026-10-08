import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import SiteHeader from '~/components/site/SiteHeader.vue'

describe('SiteHeader', () => {
  it('links the logo to the KWVR home page with descriptive alt text', async () => {
    const wrapper = await mountSuspended(SiteHeader)
    const logoLink = wrapper.find('a.site-logo-link')

    expect(logoLink.attributes('href')).toBe('https://kwvr.co.uk/')
    expect(logoLink.find('img').attributes('alt')).toBe('Keighley & Worth Valley Railway home')
  })

  it('renders the labelled main navigation, ending with the donate button', async () => {
    const wrapper = await mountSuspended(SiteHeader)
    const mainNav = wrapper.find('nav[aria-label="Main"]')
    const navLinkLabels = mainNav.findAll('a').map(navLink => navLink.text())

    expect(navLinkLabels).toEqual(['Accessibility', 'Directions', 'Fares', 'Dogs', 'Food & drink', 'Donate'])
    expect(mainNav.find('a.button-primary').text()).toBe('Donate')
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSuspended(SiteHeader)

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

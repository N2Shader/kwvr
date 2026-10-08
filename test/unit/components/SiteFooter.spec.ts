import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import SiteFooter from '~/components/site/SiteFooter.vue'

describe('SiteFooter', () => {
  it('shows the organisation name and registration details', async () => {
    const wrapper = await mountSuspended(SiteFooter)

    expect(wrapper.text()).toContain('Keighley and Worth Valley Railway Preservation Society Limited')
    expect(wrapper.text()).toContain('Company registered in England No. 07135945, Charity registration No. 1136853')
  })

  it('links the telephone number and email address', async () => {
    const wrapper = await mountSuspended(SiteFooter)
    const telephoneLink = wrapper.find('address a[href^="tel:"]')
    const emailLink = wrapper.find('address a[href^="mailto:"]')

    expect(telephoneLink.attributes('href')).toBe('tel:+441535645214')
    expect(telephoneLink.text()).toBe('01535 645214')
    expect(emailLink.attributes('href')).toBe('mailto:admin@kwvr.co.uk')
    expect(emailLink.text()).toBe('admin@kwvr.co.uk')
  })

  it('renders the legal links in a labelled navigation landmark', async () => {
    const wrapper = await mountSuspended(SiteFooter)
    const legalLinkLabels = wrapper.findAll('nav[aria-label="Legal"] a').map(legalLink => legalLink.text())

    expect(legalLinkLabels).toEqual(['Terms & Conditions', 'Privacy Policy'])
  })

  it('renders the social links as text', async () => {
    const wrapper = await mountSuspended(SiteFooter)
    const socialLinkLabels = wrapper.findAll('ul[aria-label="Social media"] a').map(socialLink => socialLink.text())

    expect(socialLinkLabels).toEqual(['Facebook', 'Twitter', 'Instagram', 'YouTube', 'TikTok'])
  })

  it('uses the inverse surface on both bands so focus stays visible', async () => {
    const wrapper = await mountSuspended(SiteFooter)

    expect(wrapper.findAll('footer > .surface-inverse')).toHaveLength(2)
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSuspended(SiteFooter)

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

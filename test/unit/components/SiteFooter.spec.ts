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

  it('renders the social links as logos named by visually hidden text, opening in a new tab', async () => {
    const wrapper = await mountSuspended(SiteFooter)
    const socialLinks = wrapper.findAll('ul[aria-label="Social media"] a')

    expect(socialLinks.map(socialLink => socialLink.find('.visually-hidden').text()))
      .toEqual([
        'Facebook (opens in a new tab)',
        'X (formerly Twitter) (opens in a new tab)',
        'Instagram (opens in a new tab)',
        'YouTube (opens in a new tab)',
        'TikTok (opens in a new tab)',
      ])
    socialLinks.forEach((socialLink) => {
      expect(socialLink.find('.social-icon').attributes('aria-hidden')).toBe('true')
      expect(socialLink.attributes('target')).toBe('_blank')
      expect(socialLink.attributes('rel')).toContain('noopener')
    })
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

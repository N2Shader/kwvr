import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import SiteNav from '~/components/site/SiteNav.vue'

// happy-dom reports a 1024px-wide window, so the mobile menu motion (GSAP, < 64rem) is skipped
// and open/close are instant — the panel class changes straight away.
describe('SiteNav', () => {
  it('starts with the menu closed and the toggle pointing at the menu', async () => {
    const wrapper = await mountSuspended(SiteNav)
    const menuToggle = wrapper.find('button.site-nav-toggle')

    expect(menuToggle.attributes('aria-expanded')).toBe('false')
    expect(menuToggle.attributes('aria-controls')).toBe('site-nav-menu')
    expect(wrapper.find('#site-nav-menu').exists()).toBe(true)
    expect(menuToggle.text()).toBe('Menu')
  })

  it('opens the menu when the toggle is clicked', async () => {
    const wrapper = await mountSuspended(SiteNav)
    const menuToggle = wrapper.find('button.site-nav-toggle')

    await menuToggle.trigger('click')

    expect(menuToggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('#site-nav-menu').classes()).toContain('is-open')
  })

  it('closes the menu on Escape and returns focus to the toggle', async () => {
    const wrapper = await mountSuspended(SiteNav, { attachTo: document.body })
    const menuToggle = wrapper.find('button.site-nav-toggle')

    await menuToggle.trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(menuToggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('#site-nav-menu').classes()).not.toContain('is-open')
    expect(document.activeElement).toBe(menuToggle.element)

    wrapper.unmount()
  })

  it('closes the menu when focus moves out of it, so it never covers the focused field (WCAG 2.4.11)', async () => {
    const wrapper = await mountSuspended(SiteNav)
    const menuToggle = wrapper.find('button.site-nav-toggle')
    const elsewhereOnPage = document.createElement('button')

    await menuToggle.trigger('click')
    wrapper.find('.site-nav-link').element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: elsewhereOnPage }))
    await nextTick()

    expect(menuToggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('#site-nav-menu').classes()).not.toContain('is-open')
  })

  it('keeps the menu open while focus moves within it, or leaves the window', async () => {
    const wrapper = await mountSuspended(SiteNav)
    const menuToggle = wrapper.find('button.site-nav-toggle')
    const [firstNavLink, secondNavLink] = wrapper.findAll('.site-nav-link')

    await menuToggle.trigger('click')
    firstNavLink?.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: secondNavLink?.element }))
    secondNavLink?.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    await nextTick()

    expect(menuToggle.attributes('aria-expanded')).toBe('true')
  })

  it('has no detectable accessibility violations with the menu closed', async () => {
    const wrapper = await mountSuspended(SiteNav)

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })

  it('has no detectable accessibility violations with the menu open', async () => {
    const wrapper = await mountSuspended(SiteNav)

    await wrapper.find('button.site-nav-toggle').trigger('click')

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

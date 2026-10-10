import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import { createError } from '#app'
import ErrorPage from '~/error.vue'

const mountErrorPage = (statusCode: number) => mountSuspended(ErrorPage, {
  props: { error: createError({ statusCode }) },
})

describe('error page', () => {
  it('copies kwvr.co.uk’s 404 heading and text', async () => {
    const wrapper = await mountErrorPage(404)

    expect(wrapper.find('.error-page h1').text()).toBe('Oops! That page can’t be found.')
    expect(wrapper.find('.error-page p').text()).toBe('It looks like nothing was found at this location.')
  })

  it('offers a link home instead of a search form', async () => {
    const wrapper = await mountErrorPage(404)
    const homeLink = wrapper.find('.error-page a[href="/"]')

    expect(homeLink.exists()).toBe(true)
    expect(homeLink.text()).toBe('Take me home please')
    expect(wrapper.find('form[role="search"]').exists()).toBe(false)
  })

  it('keeps the site shell around the page', async () => {
    const wrapper = await mountErrorPage(404)

    expect(wrapper.find('a[href="#main"]').exists()).toBe(true)
    expect(wrapper.find('main#main h1').exists()).toBe(true)
  })

  it('shows generic copy for other errors', async () => {
    const wrapper = await mountErrorPage(500)

    expect(wrapper.find('.error-page h1').text()).toBe('Sorry, something went wrong.')
    expect(wrapper.find('.error-page p').text()).toBe('Please try again in a moment.')
    expect(wrapper.find('.error-page a[href="/"]').text()).toBe('Take me home please')
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountErrorPage(404)

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

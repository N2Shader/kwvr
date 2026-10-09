import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableSearchHero from '~/components/timetable/TimetableSearchHero.vue'

const getSrcsetWidths = (srcset = '') => srcset.split(', ').map(candidate => Number.parseInt(candidate.split(' ').at(-1) ?? ''))

describe('TimetableSearchHero', () => {
  it('serves phones a smaller square crop of the hero photo', async () => {
    const wrapper = await mountSuspended(TimetableSearchHero)
    const mobileSource = wrapper.find('picture > source')

    expect(mobileSource.attributes('media')).toBe('(max-width: 47.99rem)')
    expect(mobileSource.attributes('type')).toBe('image/webp')
    expect(getSrcsetWidths(mobileSource.attributes('srcset'))).toEqual([320, 512])
  })

  it('serves wider screens the full photo, never wider than the 1536px original', async () => {
    const wrapper = await mountSuspended(TimetableSearchHero)
    const heroImage = wrapper.find('picture > img')

    expect(getSrcsetWidths(heroImage.attributes('srcset'))).toEqual([768, 1024, 1536])
    expect(heroImage.attributes('srcset')).toContain('hero-train-45596.webp')
  })

  it('treats the photo as decorative and loads it first', async () => {
    const wrapper = await mountSuspended(TimetableSearchHero)
    const heroImage = wrapper.find('picture > img')

    expect(heroImage.attributes('alt')).toBe('')
    expect(heroImage.attributes('fetchpriority')).toBe('high')
    expect(heroImage.attributes('loading')).toBeUndefined()
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSuspended(TimetableSearchHero)

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

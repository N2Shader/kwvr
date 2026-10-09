import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import StationBento from '~/components/station/StationBento.vue'
import { stationHighlights } from '~/data/stationHighlights'

const mountStationBento = () => mountSuspended(StationBento, { props: { highlights: stationHighlights } })

describe('StationBento', () => {
  it('lists one card per station, in line order', async () => {
    const wrapper = await mountStationBento()

    const cardTitles = wrapper.findAll('li h3').map(title => title.text())
    expect(cardTitles).toEqual([
      'Next train from Keighley',
      'Next train from Ingrow West',
      'Next train from Damems',
      'Next train from Oakworth',
      'Next train from Haworth',
      'Next train from Oxenhope',
    ])
  })

  it('describes each card\'s button with its label and description', async () => {
    const wrapper = await mountStationBento()

    const haworthButton = wrapper.get('li:nth-child(5) button')
    const describedByText = (haworthButton.attributes('aria-describedby') ?? '')
      .split(' ')
      .map(describedById => wrapper.find(`[id="${describedById}"]`).text())

    expect(describedByText).toEqual(['Brontë country', 'The Brontës, steam and moorland.'])
  })

  it('keeps the photos decorative, lazy and responsive', async () => {
    const wrapper = await mountStationBento()

    const cardImages = wrapper.findAll('img')
    expect(cardImages).toHaveLength(stationHighlights.length)
    for (const cardImage of cardImages) {
      expect(cardImage.attributes('alt')).toBe('')
      expect(cardImage.attributes('loading')).toBe('lazy')
      expect(cardImage.attributes('srcset')).toContain('1280w')
    }
  })

  it('gives the two wide cards (3rd and 4th) wider image sizes', async () => {
    const wrapper = await mountStationBento()

    const imageSizes = wrapper.findAll('img').map(cardImage => cardImage.attributes('sizes'))
    expect(imageSizes[2]).toBe(imageSizes[3])
    expect(imageSizes[2]).toContain('35rem')
    expect(imageSizes[0]).toContain('17rem')
  })

  it('emits the station when a card is chosen', async () => {
    const wrapper = await mountStationBento()

    await wrapper.get('li:nth-child(5) button').trigger('click')

    expect(wrapper.emitted('select-station')).toEqual([[{ id: 'haworth', name: 'Haworth' }]])
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountStationBento()

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

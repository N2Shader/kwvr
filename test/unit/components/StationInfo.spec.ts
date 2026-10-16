import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import StationInfo from '~/components/station/StationInfo.vue'
import { stationDetailsList } from '~/data/stationDetails'

const getStationDetailsById = (stationId: string) => {
  const stationDetails = stationDetailsList.find(details => details.station.id === stationId)
  if (!stationDetails) throw new Error(`No station details for ${stationId}`)
  return stationDetails
}

const mountStationInfo = (stationId: string, mountOptions: { attachTo?: HTMLElement } = {}) =>
  mountSuspended(StationInfo, { props: { details: getStationDetailsById(stationId) }, ...mountOptions })

describe('StationInfo', () => {
  it('names and describes the station', async () => {
    const wrapper = await mountStationInfo('haworth')

    expect(wrapper.get('h2').text()).toBe('Haworth Station')
    expect(wrapper.get('.station-info-text p').text()).toContain('Brontë Parsonage Museum')
  })

  it('lists the station’s things to do under their own heading', async () => {
    const wrapper = await mountStationInfo('haworth')

    expect(wrapper.get('h3').text()).toBe('Things to do')
    expect(wrapper.findAll('.station-things-to-do li').map(thingToDo => thingToDo.text())).toEqual([
      '‘Railway Children’ walk',
      'Station shop',
      'Guided tours',
      'The Royal Oak',
      'Food and drink',
    ])
  })

  it('leaves out "Things to do" for a station that lists none (Damems)', async () => {
    const wrapper = await mountStationInfo('damems')

    expect(wrapper.get('h2').text()).toBe('Damems Station')
    expect(wrapper.get('.station-info-text p').text()).toContain('request stop')
    expect(wrapper.find('h3').exists()).toBe(false)
    expect(wrapper.find('ul').exists()).toBe(false)
  })

  it('doesn\'t load the map until asked: a button and a link to OpenStreetMap instead', async () => {
    const wrapper = await mountStationInfo('haworth')

    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.get('.station-map-placeholder p').text()).toBe('The map comes from OpenStreetMap, an outside site.')
    expect(wrapper.get('.station-map-placeholder button').text()).toBe('Show map of Haworth station')

    const mapLink = wrapper.get('a.station-map-link')
    expect(mapLink.text()).toBe('Open in OpenStreetMap (opens in a new tab)')
    expect(mapLink.attributes('href')).toBe('https://www.openstreetmap.org/?mlat=53.8312&mlon=-1.9488#map=16/53.8312/-1.9488')
    expect(mapLink.attributes('target')).toBe('_blank')
    expect(mapLink.attributes('rel')).toBe('noopener noreferrer')
  })

  it('loads the titled map pinned on the station when asked, and moves focus into it', async () => {
    const wrapper = await mountStationInfo('haworth', { attachTo: document.body })

    await wrapper.get('.station-map-placeholder button').trigger('click')
    await vi.waitFor(() => expect(wrapper.find('iframe').exists()).toBe(true))

    const stationMap = wrapper.get('iframe')
    expect(stationMap.attributes('title')).toBe('Map of Haworth station')
    expect(stationMap.attributes('src')).toBe('https://www.openstreetmap.org/export/embed.html?bbox=-1.9548,53.8287,-1.9428,53.8337&layer=mapnik&marker=53.8312,-1.9488')
    // Our origin only: the search in the address bar never reaches OpenStreetMap
    expect(stationMap.attributes('referrerpolicy')).toBe('strict-origin-when-cross-origin')
    expect(wrapper.find('.station-map-placeholder').exists()).toBe(false)
    await vi.waitFor(() => expect(document.activeElement).toBe(stationMap.element))

    wrapper.unmount()
  })

  it.each(['haworth', 'damems'])('has no detectable accessibility violations (%s)', async (stationId) => {
    const wrapper = await mountStationInfo(stationId)

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })

  it('has no detectable accessibility violations with the map loaded', async () => {
    const wrapper = await mountStationInfo('haworth')

    await wrapper.get('.station-map-placeholder button').trigger('click')
    await vi.waitFor(() => expect(wrapper.find('iframe').exists()).toBe(true))

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

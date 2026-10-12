import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import StationInfo from '~/components/station/StationInfo.vue'
import { stationDetailsList } from '~/data/stationDetails'

const getStationDetailsById = (stationId: string) => {
  const stationDetails = stationDetailsList.find(details => details.station.id === stationId)
  if (!stationDetails) throw new Error(`No station details for ${stationId}`)
  return stationDetails
}

const mountStationInfo = (stationId: string) =>
  mountSuspended(StationInfo, { props: { details: getStationDetailsById(stationId) } })

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

  it('embeds a lazy, titled map pinned on the station', async () => {
    const wrapper = await mountStationInfo('haworth')

    const stationMap = wrapper.get('iframe')
    expect(stationMap.attributes('title')).toBe('Map of Haworth station')
    expect(stationMap.attributes('src')).toBe('https://maps.google.com/maps?q=53.8312,-1.9488&z=15&hl=en-GB&output=embed')
    expect(stationMap.attributes('loading')).toBe('lazy')
  })

  it.each(['haworth', 'damems'])('has no detectable accessibility violations (%s)', async (stationId) => {
    const wrapper = await mountStationInfo(stationId)

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})

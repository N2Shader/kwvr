import { describe, expect, it } from 'vitest'
import { getMapEmbedSrcByLocation, getMapLinkHrefByLocation } from '~/utils/stationMapLinks'

const haworthLocation = { latitude: 53.8312, longitude: -1.9488 }

describe('getMapEmbedSrcByLocation', () => {
  it('frames OpenStreetMap\'s embed round the location, with a marker on it', () => {
    expect(getMapEmbedSrcByLocation(haworthLocation)).toBe('https://www.openstreetmap.org/export/embed.html?bbox=-1.9548,53.8287,-1.9428,53.8337&layer=mapnik&marker=53.8312,-1.9488')
  })
})

describe('getMapLinkHrefByLocation', () => {
  it('links to the location on openstreetmap.org itself', () => {
    expect(getMapLinkHrefByLocation(haworthLocation)).toBe('https://www.openstreetmap.org/?mlat=53.8312&mlon=-1.9488#map=16/53.8312/-1.9488')
  })
})

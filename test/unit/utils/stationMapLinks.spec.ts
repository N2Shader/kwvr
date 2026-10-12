import { describe, expect, it } from 'vitest'
import { getMapEmbedSrcByLocation, getMapLinkHrefByLocation } from '~/utils/stationMapLinks'

const haworthLocation = { latitude: 53.8312, longitude: -1.9488 }

describe('getMapEmbedSrcByLocation', () => {
  it('pins Google\'s key-free embed on the location, in British English', () => {
    expect(getMapEmbedSrcByLocation(haworthLocation)).toBe('https://maps.google.com/maps?q=53.8312,-1.9488&z=15&hl=en-GB&output=embed')
  })
})

describe('getMapLinkHrefByLocation', () => {
  it('links to the location on Google Maps itself', () => {
    expect(getMapLinkHrefByLocation(haworthLocation)).toBe('https://www.google.com/maps/search/?api=1&query=53.8312,-1.9488')
  })
})

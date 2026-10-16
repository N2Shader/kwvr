import type { StationMapLocation } from '~/types/timetable'

// OpenStreetMap addresses for a station's location: StationInfo's map and link, and the Markdown for agents.

// Half the embed's box around the station, in degrees: about 800m by 550m, the streets round the station
const MAP_EMBED_HALF_WIDTH_DEGREES = 0.006
const MAP_EMBED_HALF_HEIGHT_DEGREES = 0.0025

// Four decimals, like the locations themselves, so floating-point noise never reaches the URL
const roundCoordinate = (coordinate: number) => Number(coordinate.toFixed(4))

/** OpenStreetMap's embed (no key needed): the box around the station, with a marker on it */
export const getMapEmbedSrcByLocation = ({ latitude, longitude }: StationMapLocation) => {
  const mapEmbedBox = [
    longitude - MAP_EMBED_HALF_WIDTH_DEGREES,
    latitude - MAP_EMBED_HALF_HEIGHT_DEGREES,
    longitude + MAP_EMBED_HALF_WIDTH_DEGREES,
    latitude + MAP_EMBED_HALF_HEIGHT_DEGREES,
  ].map(roundCoordinate).join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${mapEmbedBox}&layer=mapnik&marker=${latitude},${longitude}`
}

/** The same place on openstreetmap.org itself, with a marker on the station */
export const getMapLinkHrefByLocation = ({ latitude, longitude }: StationMapLocation) =>
  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`

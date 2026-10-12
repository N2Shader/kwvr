import type { StationMapLocation } from '~/types/timetable'

// Google Maps addresses for a station's location: StationInfo's map and link, and the Markdown for agents.

/** Google's key-free embed (the project has no Maps API key), pinned on the station */
export const getMapEmbedSrcByLocation = ({ latitude, longitude }: StationMapLocation) =>
  `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&hl=en-GB&output=embed`

/** The same place on Google Maps itself, in its documented link format */
export const getMapLinkHrefByLocation = ({ latitude, longitude }: StationMapLocation) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

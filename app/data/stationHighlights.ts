import type { StationHighlight } from '~/types/timetable'

// Site content, not API data: copy and photos from https://kwvr.co.uk/visiting-the-kwvr/stations/
// Photos: the site's 2000px JPEGs, resized to 1280px WebP (wide enough for the largest card at 2x).
// In line order, Keighley to Oxenhope; station ids match the timetable's.
export const stationHighlights: StationHighlight[] = [
  {
    station: { id: 'keighley', name: 'Keighley' },
    label: 'Northern terminus',
    description: 'Our gateway to the world, beside the mainline platforms.',
    imageSrc: '/images/stations/keighley.webp',
    imageWidth: 1280,
    imageHeight: 853,
    pageHref: 'https://kwvr.co.uk/visiting-the-kwvr/stations/keighley-station/',
  },
  {
    station: { id: 'ingrow-west', name: 'Ingrow West' },
    label: 'Home of RailStory',
    description: 'A Victorian station, moved here brick by brick.',
    imageSrc: '/images/stations/ingrow-west.webp',
    imageWidth: 1280,
    imageHeight: 853,
    pageHref: 'https://kwvr.co.uk/visiting-the-kwvr/stations/ingrow-west-station/',
  },
  {
    station: { id: 'damems', name: 'Damems' },
    label: 'Request stop',
    description: 'Britain’s smallest station: our world in miniature.',
    imageSrc: '/images/stations/damems.webp',
    imageWidth: 1280,
    imageHeight: 960,
    pageHref: 'https://kwvr.co.uk/visiting-the-kwvr/stations/damems-station/',
  },
  {
    station: { id: 'oakworth', name: 'Oakworth' },
    label: 'Film location',
    description: 'Catch the spirit of ‘The Railway Children’.',
    imageSrc: '/images/stations/oakworth.webp',
    imageWidth: 1280,
    imageHeight: 851,
    pageHref: 'https://kwvr.co.uk/visiting-the-kwvr/stations/oakworth-station/',
  },
  {
    station: { id: 'haworth', name: 'Haworth' },
    label: 'Brontë country',
    description: 'The Brontës, steam and moorland.',
    imageSrc: '/images/stations/haworth.webp',
    imageWidth: 1280,
    imageHeight: 854,
    pageHref: 'https://kwvr.co.uk/visiting-the-kwvr/stations/haworth-station/',
  },
  {
    station: { id: 'oxenhope', name: 'Oxenhope' },
    label: 'Southern terminus',
    description: 'End of the line, with a picnic area and playground.',
    imageSrc: '/images/stations/oxenhope.webp',
    imageWidth: 1280,
    imageHeight: 860,
    pageHref: 'https://kwvr.co.uk/visiting-the-kwvr/stations/oxenhope-station/',
  },
]

import type { StationDetails } from '~/types/timetable'

// Site content, not API data: the block under the results for the searched station.
// Descriptions in our own words and "Things to do" titles from each page under
// https://kwvr.co.uk/visiting-the-kwvr/stations/ (Damems' page lists none).
// Map locations: each station's coordinates on Wikipedia.
// In line order, Keighley to Oxenhope; station ids match the timetable's.
export const stationDetailsList: StationDetails[] = [
  {
    station: { id: 'keighley', name: 'Keighley' },
    description: 'Our northern terminus, on the edge of the town centre, where our platforms 3 and 4 sit beside the mainline’s 1 and 2. Our side keeps the feel of a 1950s British Railways station, with the glass canopy and waiting room on platform 4, and a turntable and signal box at the end of platform 3.',
    thingsToDo: [
      'Heritage and shopping',
      'The Water Tower',
      'Keighley Bus Museum',
      'East Riddlesden Hall',
      'The Old Parcels Office café & bar',
    ],
    mapLocation: { latitude: 53.8679, longitude: -1.9011 },
  },
  {
    station: { id: 'ingrow-west', name: 'Ingrow West' },
    description: 'The first stop up the line from Keighley, beside the Keighley to Halifax road. The original building was demolished after the branch closed in 1962; today’s was moved here, brick by brick, from Foulridge in Lancashire. Ingrow is our centre of learning, home of the RailStory classroom and two railway museums.',
    thingsToDo: [
      'Heritage and shopping',
      'The station building',
      'The Carriage Works',
      'The Engine Shed',
      'The Learning Coach',
      'Food and drink',
    ],
    mapLocation: { latitude: 53.8539, longitude: -1.915 },
  },
  {
    station: { id: 'damems', name: 'Damems' },
    description: 'Britain’s smallest operating passenger station, about two miles from Keighley and reached on foot. Opened in 1868, it’s now a request stop: tell the guard if you’d like to get off here. Look out for the level crossing and the signal box rescued from Earby.',
    thingsToDo: [],
    mapLocation: { latitude: 53.8459, longitude: -1.9245 },
  },
  {
    station: { id: 'oakworth', name: 'Oakworth' },
    description: 'Between Damems and Haworth, Oakworth’s Edwardian station was the main filming location for ‘The Railway Children’ (1970), and it keeps that film’s atmosphere. Opened in 1867 and reopened with the line in 1968, it has won Best Restored Station several times.',
    thingsToDo: [
      'Tea hut',
      'The ‘Railway Children’ walk',
    ],
    mapLocation: { latitude: 53.8414, longitude: -1.9416 },
  },
  {
    station: { id: 'haworth', name: 'Haworth' },
    description: 'Our main intermediate station, about 20 minutes from Keighley, and the railway’s administration, locomotive and engineering centre. The Brontë Parsonage Museum, once the sisters’ home, is up the hill in the old village.',
    thingsToDo: [
      '‘Railway Children’ walk',
      'Station shop',
      'Guided tours',
      'The Royal Oak',
      'Food and drink',
    ],
    mapLocation: { latitude: 53.8312, longitude: -1.9488 },
  },
  {
    station: { id: 'oxenhope', name: 'Oxenhope' },
    description: 'Our southern terminus, 4¾ miles from Keighley, with free parking and a picnic area. Here you’ll find a station shop in the old booking office, a tearoom in a former buffet car and an exhibition shed of locomotives waiting for restoration.',
    thingsToDo: [
      'Playground',
      'The tearoom',
      'Exhibition shed',
      'Station shop',
    ],
    mapLocation: { latitude: 53.8154, longitude: -1.9519 },
  },
]

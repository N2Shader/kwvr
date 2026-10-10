import type { Station } from '~/types/timetable'

// What /api/timetable/search answers with: one colour's timetable, train by train.
// Times are `HH:mm` with no date: a colour is a pattern, run on whichever days are that colour.

/** A station on the line; `notes` are codes from the response's `key` (e.g. `rail-story` at Ingrow West) */
export interface TimetableApiStation extends Station {
  notes: string[]
}

/** One stop of a train, as the printed timetable's `d` / `a` column says: a departure, or (at the last stop) an arrival */
export interface TimetableApiCall {
  stationId: string
  time: string
  timeType: 'departure' | 'arrival'
  /** The train only stops if asked (Damems), the key's `x` */
  requestStop?: boolean
}

export interface TimetableApiService {
  id: string
  /** Codes from the response's `key`, e.g. `diesel`, or `steam` and `bar` */
  notes: string[]
  /** In running order, first station to last; a train may start or end part-way down the line */
  calls: TimetableApiCall[]
}

/** Every train running one way down the line, e.g. Oxenhope → Keighley */
export interface TimetableApiJourney {
  from: string
  to: string
  services: TimetableApiService[]
}

/**
 * One line of the timetable's key. The symbols (trains and stations) have a `label`, short enough for
 * an image's alt text, and an `icon` (a path under /public); the letters (`a`, `d`, `x`) have neither.
 */
export interface TimetableApiKeyEntry {
  code: string
  label?: string
  description: string
  icon?: string
}

export interface TimetableApiResponse {
  /** The timetable's colour, e.g. `orange` */
  timeTable: string
  stations: TimetableApiStation[]
  journeys: TimetableApiJourney[]
  key: TimetableApiKeyEntry[]
}

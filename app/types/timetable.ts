import type { CalendarDate, Time } from '@internationalized/date'

export interface Station {
  id: string
  name: string
}

export interface TimetableSearchCriteria {
  origin: Station
  /** Local ISO date-time without offset, e.g. `2026-04-24T12:00` */
  departingAfter: string
}

/**
 * Form prefill. Origin is optional so the form can start on "Select a station".
 * The date and time aren't here: they come from the user's clock (see `getDepartureDefaultsByClock`).
 */
export type TimetableSearchDefaults = Partial<Pick<TimetableSearchCriteria, 'origin'>>

/** What the search form holds before it's checked: any field may still be empty (or out of date) */
export interface TimetableSearchFormValues {
  originId?: string
  departingDate?: CalendarDate
  departingTime?: Time
}

/** One short message per field that needs fixing; a field with no entry is fine */
export type TimetableSearchFormErrors = Partial<Record<keyof TimetableSearchFormValues, string>>

export interface TrainService {
  id: string
  origin: Station
  destination: Station
  /** Local ISO date-time without offset, e.g. `2026-04-24T12:20` */
  departsAt: string
  /** Local ISO date-time without offset, e.g. `2026-04-24T13:00` */
  arrivesAt: string
  /** Intermediate stops; 0 means direct */
  stopCount: number
  hasServiceAlert: boolean
  /** The latest departure from the searched station today, either way down the line: the last row only */
  isLastTrain: boolean
  /** Last train first (if it is), then the train's symbols (diesel, steam, bar) and those of the stations it calls at from the origin on */
  notes: TrainServiceNote[]
  /** The journey's stops, from the searched station to the last */
  calls: TrainServiceCall[]
}

/** One stop of a result's journey, from the searched station to the last */
export interface TrainServiceCall {
  station: Station
  /** Local ISO date-time without offset, e.g. `2026-04-24T12:20` */
  time: string
  timeType: 'departure' | 'arrival'
  /** The key's `x` wording when the train only stops on request (Damems); undefined otherwise */
  requestStopDescription?: string
  /** The station's symbols (e.g. Rail Story at Ingrow West) */
  notes: TrainServiceNote[]
}

/** A timetable symbol on a result, from the response's key */
export interface TrainServiceNote {
  code: string
  /** Short, for the icon's alt text, e.g. "Diesel train" */
  label: string
  /** The key's full wording, for the key under the results */
  description: string
  /** Path under /public */
  iconSrc: string
}

/**
 * What the content area under the search box shows; one component per status.
 * `checking-link`: a search from the address bar (a shared link), shown as loading from the first paint,
 * but only sent once the form has checked it in the browser (the check reads the user's clock).
 */
export type TimetableSearchState =
  | { status: 'first-use' }
  | { status: 'checking-link', criteria: TimetableSearchCriteria }
  | { status: 'loading', criteria: TimetableSearchCriteria }
  | { status: 'results', criteria: TimetableSearchCriteria, services: TrainService[] }
  | { status: 'no-results', criteria: TimetableSearchCriteria }
  | { status: 'error', criteria: TimetableSearchCriteria }

/** Where a station's map is centred and pinned */
export interface StationMapLocation {
  latitude: number
  longitude: number
}

/** The searched station's block under the results: about it, what's nearby, and a map, from kwvr.co.uk */
export interface StationDetails {
  station: Station
  description: string
  /** Titles from the station page's "Things to do"; empty when it lists none (Damems) */
  thingsToDo: string[]
  mapLocation: StationMapLocation
}

/**
 * A station card, from kwvr.co.uk: a photo and a short line about the station. On the first-use state
 * (the bento) and, three picked at random, under the results.
 */
export interface StationHighlight {
  station: Station
  /** Short tag at the top of the card, e.g. "Northern terminus" */
  label: string
  description: string
  /** WebP original in public/images/stations; @nuxt/image serves resized copies */
  imageSrc: string
  imageWidth: number
  imageHeight: number
  /** The station's page on kwvr.co.uk */
  pageHref: string
}

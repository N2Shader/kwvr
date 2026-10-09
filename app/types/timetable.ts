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
}

/** What the content area under the search box shows; one component per status */
export type TimetableSearchState =
  | { status: 'first-use' }
  | { status: 'loading', criteria: TimetableSearchCriteria }
  | { status: 'results', criteria: TimetableSearchCriteria, services: TrainService[] }
  | { status: 'no-results', criteria: TimetableSearchCriteria }
  | { status: 'error', criteria: TimetableSearchCriteria }

export interface StationDetails {
  station: Station
  description: string
}

/** A station card on the first-use state: a photo and a short line about the station, from kwvr.co.uk */
export interface StationHighlight {
  station: Station
  /** Short tag at the top of the card, e.g. "Northern terminus" */
  label: string
  description: string
  /** WebP original in public/images/stations; @nuxt/image serves resized copies */
  imageSrc: string
  imageWidth: number
  imageHeight: number
}

export interface StationAttraction {
  id: string
  title: string
  description: string
  imageSrc: string
}

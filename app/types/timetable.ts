export interface Station {
  id: string
  name: string
}

export interface TimetableSearchCriteria {
  origin: Station
  /** Local ISO date-time without offset, e.g. `2026-04-24T12:00` */
  departingAfter: string
}

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

export interface StationDetails {
  station: Station
  description: string
}

export interface StationAttraction {
  id: string
  title: string
  description: string
  imageSrc: string
}

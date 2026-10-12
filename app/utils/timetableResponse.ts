import type { TimetableSearchCriteria, TrainService, TrainServiceCall, TrainServiceNote } from '~/types/timetable'
import type { TimetableApiCall, TimetableApiJourney, TimetableApiResponse, TimetableApiService } from '~/types/timetableApi'

// Turns the endpoint's answer (a whole timetable, train by train) into the result rows for one search.

/** The key's code for the last train's symbol; the response doesn't mark the train, it's worked out here */
const LAST_TRAIN_NOTE_CODE = 'last-train'

/**
 * The key's symbols for these codes, in the codes' order, each once. Codes with no symbol in the key
 * (none yet, or the letters `a` / `d` / `x`) are left out.
 */
const getTrainServiceNotesByCodes = (noteCodes: string[], response: TimetableApiResponse): TrainServiceNote[] =>
  [...new Set(noteCodes)].flatMap((noteCode) => {
    const keyEntry = response.key.find(entry => entry.code === noteCode)
    if (!keyEntry?.label || !keyEntry.icon) return []
    return [{ code: keyEntry.code, label: keyEntry.label, description: keyEntry.description, iconSrc: keyEntry.icon }]
  })

/**
 * The journey's stops from the origin on, each dated on the searched day. A stop's name and symbols
 * come from the response's stations; a request stop gets the key's `x` wording.
 */
const getTrainServiceCallsByOrigin = (
  callsFromOrigin: TimetableApiCall[],
  response: TimetableApiResponse,
  departureDate: string | undefined,
): TrainServiceCall[] => {
  const requestStopDescription = response.key.find(entry => entry.code === 'x')?.description

  return callsFromOrigin.flatMap((call) => {
    const station = response.stations.find(responseStation => responseStation.id === call.stationId)
    if (!station) return []
    return [{
      station: { id: station.id, name: station.name },
      time: `${departureDate}T${call.time}`,
      timeType: call.timeType,
      requestStopDescription: call.requestStop ? requestStopDescription : undefined,
      notes: getTrainServiceNotesByCodes(station.notes, response),
    }]
  })
}

/**
 * The service as a result row from the searched station, or `undefined` when it doesn't fit the search:
 * it doesn't call there, it only arrives there (it ends there), or it leaves before the searched time.
 */
const getMatchingTrainServiceByCriteria = (
  service: TimetableApiService,
  response: TimetableApiResponse,
  criteria: TimetableSearchCriteria,
): TrainService | undefined => {
  // `2026-10-09T14:30` → the day (to date the `HH:mm` times) and the time to compare with
  const [departureDate, earliestDepartureTime = ''] = criteria.departingAfter.split('T')
  const originIndex = service.calls.findIndex(call => call.stationId === criteria.origin.id)
  const originCall = service.calls[originIndex]
  const lastCall = service.calls.at(-1)
  const destination = response.stations.find(station => station.id === lastCall?.stationId)

  if (originCall?.timeType !== 'departure' || lastCall?.timeType !== 'arrival' || !destination) return undefined
  // Zero-padded `HH:mm`, so comparing the strings compares the times
  if (originCall.time < earliestDepartureTime) return undefined

  const callsFromOrigin = service.calls.slice(originIndex)
  // The train's own symbols first, then those of the stations it calls at from the origin on
  const stationNoteCodes = callsFromOrigin
    .flatMap(call => response.stations.find(station => station.id === call.stationId)?.notes ?? [])

  return {
    id: service.id,
    origin: criteria.origin,
    destination: { id: destination.id, name: destination.name },
    departsAt: `${departureDate}T${originCall.time}`,
    arrivesAt: `${departureDate}T${lastCall.time}`,
    // Stops between the searched station and the last one
    stopCount: service.calls.length - originIndex - 2,
    // The response has no alerts yet
    hasServiceAlert: false,
    // Set by getTrainServicesByCriteria, which sees every other train
    isLastTrain: false,
    notes: getTrainServiceNotesByCodes([...service.notes, ...stationNoteCodes], response),
    calls: getTrainServiceCallsByOrigin(callsFromOrigin, response, departureDate),
  }
}

/** One way down the line's rows for the search */
const getJourneyTrainServicesByCriteria = (
  journey: TimetableApiJourney,
  response: TimetableApiResponse,
  criteria: TimetableSearchCriteria,
): TrainService[] =>
  journey.services
    .map(service => getMatchingTrainServiceByCriteria(service, response, criteria))
    .filter((trainService): trainService is TrainService => trainService !== undefined)

/**
 * Every train leaving the searched station at or after the searched time, either way down the line, earliest
 * first. The last row is the day's last train from the searched station, whichever way it goes (the search
 * only leaves out earlier trains), so it alone gets the key's `last-train` symbol, first.
 */
export const getTrainServicesByCriteria = (response: TimetableApiResponse, criteria: TimetableSearchCriteria): TrainService[] => {
  const trainServices = response.journeys
    .flatMap(journey => getJourneyTrainServicesByCriteria(journey, response, criteria))
    .sort((earlierService, laterService) => earlierService.departsAt.localeCompare(laterService.departsAt))
  const lastTrainIndex = trainServices.length - 1

  return trainServices.map((trainService, trainServiceIndex) => trainServiceIndex === lastTrainIndex
    ? { ...trainService, isLastTrain: true, notes: [...getTrainServiceNotesByCodes([LAST_TRAIN_NOTE_CODE], response), ...trainService.notes] }
    : trainService)
}

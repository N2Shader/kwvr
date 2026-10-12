import type { StationHighlight } from '~/types/timetable'

interface StationSuggestionOptions {
  /** The searched station, never suggested */
  excludedStationId: string
  count: number
  /** A number in [0, 1), like `Math.random`; pass a fixed sequence in tests */
  getRandomNumber?: () => number
}

/**
 * Up to `count` station cards in a random order, never the excluded station's. A Fisher–Yates shuffle
 * that stops after `count` picks: each pick takes one card at random from those left, on a copy, so the
 * list passed in stays as it is.
 */
export const pickRandomStationHighlights = (
  highlights: StationHighlight[],
  { excludedStationId, count, getRandomNumber = Math.random }: StationSuggestionOptions,
): StationHighlight[] => {
  const remainingHighlights = highlights.filter(highlight => highlight.station.id !== excludedStationId)
  const pickedHighlights: StationHighlight[] = []

  while (pickedHighlights.length < count && remainingHighlights.length > 0) {
    const pickedIndex = Math.floor(getRandomNumber() * remainingHighlights.length)
    pickedHighlights.push(...remainingHighlights.splice(pickedIndex, 1))
  }

  return pickedHighlights
}

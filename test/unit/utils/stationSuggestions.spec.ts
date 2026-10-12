import { describe, expect, it } from 'vitest'
import type { StationHighlight } from '~/types/timetable'
import { stationHighlights } from '~/data/stationHighlights'
import { pickRandomStationHighlights } from '~/utils/stationSuggestions'

// Hands out the given numbers in turn, then starts again: a stand-in for Math.random
const createRandomNumberSequence = (randomNumbers: number[]) => {
  let callIndex = 0
  return () => randomNumbers[callIndex++ % randomNumbers.length] ?? 0
}

const getStationIdsByHighlights = (highlights: StationHighlight[]) => highlights.map(highlight => highlight.station.id)

const randomNumberSequences = [[0], [0.999], [0.5], [0.5, 0.1, 0.9], [0.25, 0.75], [0.9, 0.3, 0.6, 0]]
const stationIds = getStationIdsByHighlights(stationHighlights)

describe('pickRandomStationHighlights', () => {
  it.each(stationIds)('picks 3 different stations, never the searched one (%s)', (excludedStationId) => {
    for (const randomNumbers of randomNumberSequences) {
      const pickedStationIds = getStationIdsByHighlights(pickRandomStationHighlights(stationHighlights, {
        excludedStationId,
        count: 3,
        getRandomNumber: createRandomNumberSequence(randomNumbers),
      }))

      expect(pickedStationIds).toHaveLength(3)
      expect(new Set(pickedStationIds).size).toBe(3)
      expect(pickedStationIds).not.toContain(excludedStationId)
    }
  })

  it('holds with Math.random too', () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const pickedStationIds = getStationIdsByHighlights(pickRandomStationHighlights(stationHighlights, { excludedStationId: 'haworth', count: 3 }))

      expect(new Set(pickedStationIds).size).toBe(3)
      expect(pickedStationIds).not.toContain('haworth')
    }
  })

  it('leaves the list passed in untouched', () => {
    const highlightsBefore = [...stationHighlights]

    pickRandomStationHighlights(stationHighlights, { excludedStationId: 'haworth', count: 3, getRandomNumber: () => 0.5 })

    expect(stationHighlights).toHaveLength(highlightsBefore.length)
    stationHighlights.forEach((highlight, highlightIndex) => expect(highlight).toBe(highlightsBefore[highlightIndex]))
  })

  it('takes the first card left each time when the random number is 0', () => {
    const pickedHighlights = pickRandomStationHighlights(stationHighlights, { excludedStationId: 'keighley', count: 3, getRandomNumber: () => 0 })

    expect(getStationIdsByHighlights(pickedHighlights)).toEqual(['ingrow-west', 'damems', 'oakworth'])
  })

  it('takes the last card left each time when the random number is close to 1', () => {
    const pickedHighlights = pickRandomStationHighlights(stationHighlights, { excludedStationId: 'haworth', count: 3, getRandomNumber: () => 0.999 })

    expect(getStationIdsByHighlights(pickedHighlights)).toEqual(['oxenhope', 'oakworth', 'damems'])
  })

  it('gives every other station when asked for more than there are', () => {
    const pickedHighlights = pickRandomStationHighlights(stationHighlights, { excludedStationId: 'damems', count: 10 })

    expect(getStationIdsByHighlights(pickedHighlights).sort()).toEqual(['haworth', 'ingrow-west', 'keighley', 'oakworth', 'oxenhope'])
  })
})

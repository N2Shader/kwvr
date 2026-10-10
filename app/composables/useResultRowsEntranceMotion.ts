import type { Ref } from 'vue'
import type { gsap } from 'gsap'

type Gsap = typeof gsap
type RowsMotion = ReturnType<Gsap['matchMedia']>

// Only when motion is welcome; otherwise the rows are simply there
const ROWS_MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

// Shared by the rise and the fade, so a row's rise and fade start together
const ROW_ENTRANCE_TIMING = { ease: 'sine.in', stagger: 0.025 }

/**
 * Slides the result rows up into place, one after another, when a result set appears: a short
 * distance, fast, with a gentle ease and overlapping starts, so it reads as one continuous wave.
 * Each row also comes from the back: it starts a little smaller and grows to full size as it rises.
 * Each row also fades in from 0, faster than it rises, so it's fully there while it still moves up
 * and the rise from below stays visible. The results state remounts TimetableResults after every
 * loading state, so each new search plays it once. Body rows only (`.result-row`), so the headers stay put.
 */
export const useResultRowsEntranceMotion = (resultsSectionRef: Readonly<Ref<HTMLElement | null>>) => {
  let rowsMotion: RowsMotion | undefined

  onMounted(() => {
    const resultsSection = resultsSectionRef.value
    if (!resultsSection) return

    const { $gsap } = useNuxtApp()
    rowsMotion = $gsap.matchMedia()
    rowsMotion.add(ROWS_MOTION_QUERY, () => {
      const resultRows = resultsSection.querySelectorAll<HTMLElement>('.result-row')
      if (resultRows.length === 0) return

      // One timeline, both from the start (position 0): the rise and the fade play as one entrance
      const rowsEntrance = $gsap.timeline()
      // Scale with the rise, on the same timing: smaller reads as further away, so the row comes forward
      rowsEntrance.from(resultRows, {
        ...ROW_ENTRANCE_TIMING,
        y: 32,
        scale: 0.95,
        duration: 0.25,
        clearProps: 'transform',
      }, 0)
      // On the row, never its cells: a cell below opacity 1 would stack above the journey button's hit area
      rowsEntrance.from(resultRows, {
        ...ROW_ENTRANCE_TIMING,
        opacity: 0,
        duration: 0.15,
        clearProps: 'opacity',
      }, 0)
    })
  })

  onBeforeUnmount(() => {
    rowsMotion?.revert()
  })
}

import type { Ref } from 'vue'
import type { gsap } from 'gsap'

type Gsap = typeof gsap
type RowsMotion = ReturnType<Gsap['matchMedia']>

// Only when motion is welcome; otherwise the rows are simply there
const ROWS_MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

/**
 * Slides the result rows up into place, one after another, when a result set appears: a short
 * distance, fast, with a gentle ease and overlapping starts, so it reads as one continuous wave.
 * No fade. The results state remounts TimetableResults after every loading state, so each new
 * search plays it once. Body rows only (`.result-row`), so the headers stay put.
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

      $gsap.from(resultRows, {
        y: 8,
        duration: 0.25,
        ease: 'sine.out',
        stagger: 0.075,
        clearProps: 'transform',
      })
    })
  })

  onBeforeUnmount(() => {
    rowsMotion?.revert()
  })
}

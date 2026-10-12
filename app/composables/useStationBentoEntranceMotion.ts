import type { Ref } from 'vue'
import type { gsap } from 'gsap'

type Gsap = typeof gsap
type BentoMotion = ReturnType<Gsap['matchMedia']>

interface CardOffset {
  x: number
  y: number
}

// Only when motion is welcome; otherwise the cards are simply there
const BENTO_MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

// How far outside its place each card starts, in px
const CARD_TRAVEL = 64

/**
 * Where a card starts: CARD_TRAVEL px away from its place, straight out from the bento's centre, so it
 * comes in from the side it sits on. A card right on the centre comes up from below.
 */
const getCardOffsetByCentre = (cardRect: DOMRect, bentoRect: DOMRect): CardOffset => {
  const deltaX = (cardRect.left + cardRect.width / 2) - (bentoRect.left + bentoRect.width / 2)
  const deltaY = (cardRect.top + cardRect.height / 2) - (bentoRect.top + bentoRect.height / 2)
  const distance = Math.hypot(deltaX, deltaY)
  if (distance < 1) return { x: 0, y: CARD_TRAVEL }

  return { x: (deltaX / distance) * CARD_TRAVEL, y: (deltaY / distance) * CARD_TRAVEL }
}

/**
 * The cards already show: StationBento's anti-flash guard revealed them itself after 2s (a slow phone,
 * hydration or GSAP still loading). Hiding them again to fly them in would flash, so they stay put.
 */
const areCardsAlreadyRevealed = (stationCards: HTMLElement[]) =>
  stationCards.every(stationCard => getComputedStyle(stationCard).opacity === '1')

/**
 * Brings the station cards in one after another on first use: each fades in from just outside the
 * bento and moves inwards from its own side, so they converge on the grid at every layout (four, two
 * or one column). StationBento hides the server-rendered cards until this has run (the returned flag),
 * so they don't show, vanish and fly in.
 */
export const useStationBentoEntranceMotion = (stationBentoRef: Readonly<Ref<HTMLElement | null>>) => {
  // True until the cards are hidden by GSAP (or never will be): StationBento's anti-flash guard
  const isBentoEntrancePending = ref(true)
  let bentoMotion: BentoMotion | undefined
  let isUnmounted = false

  // GSAP loads in parallel with hydration (plugins/gsap.client.ts); the guard holds the cards until it's here
  onMounted(async () => {
    const stationBento = stationBentoRef.value
    if (stationBento) {
      const $gsap = await useNuxtApp().$loadGsap()
      if (isUnmounted) return
      bentoMotion = $gsap.matchMedia()
      bentoMotion.add(BENTO_MOTION_QUERY, () => {
        const stationCards = [...stationBento.querySelectorAll<HTMLElement>('.station-bento-card')]
        if (stationCards.length === 0 || areCardsAlreadyRevealed(stationCards)) return

        // Measured before any tween moves them
        const bentoRect = stationBento.getBoundingClientRect()
        const cardOffsets = stationCards.map(stationCard => getCardOffsetByCentre(stationCard.getBoundingClientRect(), bentoRect))

        // fromTo, not from: the anti-flash guard holds the cards at opacity 0, which from() would read as the end value
        $gsap.fromTo(stationCards, {
          x: (cardIndex: number) => cardOffsets[cardIndex]?.x ?? 0,
          y: (cardIndex: number) => cardOffsets[cardIndex]?.y ?? CARD_TRAVEL,
          opacity: 0,
        }, {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
          clearProps: 'transform,opacity',
        })
      })
    }

    // GSAP has hidden the cards by now (or motion is off), so the guard can go
    isBentoEntrancePending.value = false
  })

  onBeforeUnmount(() => {
    isUnmounted = true
    bentoMotion?.revert()
  })

  return { isBentoEntrancePending }
}

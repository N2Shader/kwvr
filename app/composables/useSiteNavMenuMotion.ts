import type { Ref } from 'vue'
import type { gsap } from 'gsap'

type Gsap = typeof gsap
type MenuTimeline = ReturnType<Gsap['timeline']>
type MenuMotion = ReturnType<Gsap['matchMedia']>

// Open plays in 0.3s with an ease-out; close plays the same timeline backwards 3× faster (0.1s)
const MENU_OPEN_DURATION = 0.3
const MENU_CLOSE_TIME_SCALE = 3

// Mobile only (keep in sync with --bp-lg in tokens.css), and only when motion is welcome
const MENU_MOTION_QUERY = '(max-width: 63.999rem) and (prefers-reduced-motion: no-preference)'

/*
 * The story, in one 0.3s timeline:
 *   1. The three bars fold into a cross: the button tells you it now closes.
 *   2. The panel grows out of the button's corner, so you see where it came from.
 *   3. The links cascade in, top to bottom, once there's a surface to sit on.
 */
const buildMenuTimeline = ($gsap: Gsap, siteNav: HTMLElement, onReverseComplete: () => void): MenuTimeline => {
  const [topBar, middleBar, bottomBar] = siteNav.querySelectorAll<HTMLElement>('.site-nav-toggle-bar')
  const menuSurface = siteNav.querySelector<HTMLElement>('.site-nav-menu-surface')
  const menuItems = siteNav.querySelectorAll<HTMLElement>('.site-nav-menu-item')
  // Measured, so the cross lines up whatever the user's font size
  const barGap = (middleBar?.offsetTop ?? 0) - (topBar?.offsetTop ?? 0)

  return $gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onReverseComplete })
    .to(topBar ?? [], { y: barGap, rotation: 45, duration: 0.2 }, 0)
    .to(bottomBar ?? [], { y: -barGap, rotation: -45, duration: 0.2 }, 0)
    .to(middleBar ?? [], { scaleX: 0, opacity: 0, duration: 0.12 }, 0)
    .fromTo(menuSurface ?? [], { scaleX: 0.6, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: MENU_OPEN_DURATION }, 0)
    .fromTo(menuItems, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.16, stagger: 0.015 }, 0.06)
}

/**
 * Animates the mobile nav menu. Without a timeline (desktop, reduced motion, SSR)
 * open and close are instant.
 * `syncMenuVisibility` is called when the menu may be hidden: after the close plays,
 * or straight away when there is nothing to animate.
 */
export const useSiteNavMenuMotion = (siteNavRef: Ref<HTMLElement | null>, syncMenuVisibility: () => void) => {
  let menuTimeline: MenuTimeline | undefined
  let menuMotion: MenuMotion | undefined
  let isUnmounted = false

  // Until GSAP has loaded (see plugins/gsap.client.ts), open and close are instant
  onMounted(async () => {
    const siteNav = siteNavRef.value
    if (!siteNav) return

    const $gsap = await useNuxtApp().$loadGsap()
    if (isUnmounted) return
    menuMotion = $gsap.matchMedia()
    menuMotion.add(MENU_MOTION_QUERY, () => {
      menuTimeline = buildMenuTimeline($gsap, siteNav, syncMenuVisibility)

      // Runs when the query stops matching; GSAP has already cleared the inline styles
      return () => {
        menuTimeline = undefined
        syncMenuVisibility()
      }
    })
  })

  onBeforeUnmount(() => {
    isUnmounted = true
    menuMotion?.revert()
  })

  const playMenuOpen = () => {
    menuTimeline?.timeScale(1).play()
  }

  const playMenuClose = () => {
    if (!menuTimeline || menuTimeline.progress() === 0) {
      syncMenuVisibility()
      return
    }
    menuTimeline.timeScale(MENU_CLOSE_TIME_SCALE).reverse()
  }

  return { playMenuOpen, playMenuClose }
}

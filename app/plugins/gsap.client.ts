import { gsap } from 'gsap'

// Client-only so GSAP never runs during SSR. Access via `const { $gsap } = useNuxtApp()`.
// All animations must honour reduced motion — wrap them in `$gsap.matchMedia()`.
export default defineNuxtPlugin(() => ({
  provide: { gsap },
}))

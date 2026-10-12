// Client-only so GSAP never runs during SSR. Kept out of the entry bundle: its download starts here, at
// app start, in parallel with hydration, so it's ready by the time anything animates.
// Access via `const gsap = await useNuxtApp().$loadGsap()` (call useNuxtApp() before any await).
// All animations must honour reduced motion — wrap them in `gsap.matchMedia()`.
export default defineNuxtPlugin(() => {
  const gsapLoading = import('gsap').then(gsapModule => gsapModule.gsap)
  return {
    provide: { loadGsap: () => gsapLoading },
  }
})

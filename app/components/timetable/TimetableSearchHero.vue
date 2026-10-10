<script setup lang="ts">
// Original: 1536×512 WebP in public/images. @nuxt/image resizes and crops it on request (ipx locally),
// and the widths below stop at the original's, so nothing is ever upscaled.
const heroImageSrc = '/images/hero-train-45596.webp'

// Below 48rem the form stacks and the hero is roughly square, so phones get a centred square crop
// (the locomotive) instead of the full 3:1 panorama: far fewer bytes, same subject.
const heroMobileMedia = '(max-width: 47.99rem)'
const heroDesktopMedia = '(min-width: 48rem)'
const heroMobileWidths = [320, 512]
const heroDesktopWidths = [768, 1024, 1536]
// The site is boxed at 80rem (UContainer), so the photo never gets wider than that
const heroDesktopSizes = '(min-width: 80rem) 80rem, 100vw'

const imageUrlBuilder = useImage()

const buildHeroMobileSrcset = () => heroMobileWidths
  .map(width => `${imageUrlBuilder(heroImageSrc, { width, height: width, fit: 'cover', format: 'webp' })} ${width}w`)
  .join(', ')

const buildHeroDesktopSrcset = () => heroDesktopWidths
  .map(width => `${imageUrlBuilder(heroImageSrc, { width, format: 'webp' })} ${width}w`)
  .join(', ')

const heroMobileSrcset = buildHeroMobileSrcset()
const heroDesktopSrcset = buildHeroDesktopSrcset()

// The hero is the largest thing on first paint, so the browser starts fetching the right crop from <head>
useHead({
  link: [
    { rel: 'preload', as: 'image', type: 'image/webp', imagesrcset: heroMobileSrcset, imagesizes: '100vw', media: heroMobileMedia, fetchpriority: 'high' },
    { rel: 'preload', as: 'image', type: 'image/webp', imagesrcset: heroDesktopSrcset, imagesizes: heroDesktopSizes, media: heroDesktopMedia, fetchpriority: 'high' },
  ],
})
</script>

<template>
  <div class="search-hero">
    <!-- Decorative; the cream background shows until the image loads (or if it's missing) -->
    <picture class="search-hero-picture">
      <source
        :media="heroMobileMedia"
        :srcset="heroMobileSrcset"
        sizes="100vw"
        type="image/webp"
        width="512"
        height="512"
      >
      <img
        :src="imageUrlBuilder(heroImageSrc, { width: 1536, format: 'webp' })"
        :srcset="heroDesktopSrcset"
        :sizes="heroDesktopSizes"
        alt=""
        width="1536"
        height="512"
        fetchpriority="high"
        class="search-hero-image"
      >
    </picture>
    <div class="search-hero-card">
      <h1 class="visually-hidden">
        Find train times
      </h1>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.search-hero {
  position: relative;
  display: grid;
  place-items: center;
  min-height: var(--hero-min-height);
  padding: var(--space-4);
  background-color: var(--colour-surface-alt);
}

/* Out of the grid flow (like the image), so the card stays the only grid item and stays centred */
.search-hero-picture {
  position: absolute;
  inset: 0;
}

.search-hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/*
 * Subtle circular shade over the photo, darkest behind the search card and fading out towards the
 * edges, so the cream card stands out against the bright steam. Decorative, CSS only (no extra request).
 */
.search-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(ellipse at center, var(--colour-hero-shade) 0%, transparent 70%);
  pointer-events: none;
}

.search-hero-card {
  position: relative;
  /* Above the shade */
  z-index: 1;
  /* Wide enough for station, date, time and Search on one row, each on a single line */
  width: min(100%, 48rem);
  padding: var(--space-4) var(--space-5);
  background-color: var(--colour-surface-alt);
  border-radius: var(--radius-sm);
}

@media (min-width: 40rem) {
  .search-hero-card {
    padding: var(--space-5) var(--space-6);
  }
}
</style>

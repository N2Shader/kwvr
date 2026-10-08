<script setup lang="ts">
// Bound (not static) so Vite doesn't try to import it at build time — public/ files are served as-is
const heroImageSrc = '/images/hero-train.jpg'
</script>

<template>
  <div class="search-hero">
    <!-- Decorative; the cream background shows until the image loads (or if it's missing) -->
    <img
      :src="heroImageSrc"
      alt=""
      width="1440"
      height="480"
      fetchpriority="high"
      class="search-hero-image"
    >
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

.search-hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.search-hero-card {
  position: relative;
  width: min(100%, 36rem);
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

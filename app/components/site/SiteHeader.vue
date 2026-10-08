<script setup lang="ts">
const { homeHref } = useAppConfig()

// Bound (not static) so Vite doesn't try to import it at build time — public/ files are served as-is
const logoSrc = '/images/logo.svg'
</script>

<template>
  <header class="site-header">
    <a
      :href="homeHref"
      class="site-logo-link"
    >
      <img
        :src="logoSrc"
        alt="Keighley & Worth Valley Railway home"
        width="133"
        height="38"
        class="site-logo"
      >
    </a>
    <SiteNav class="site-header-nav" />
  </header>
</template>

<style scoped>
/* Mobile first: logo centred, hamburger on the right; the open menu is positioned against the header */
.site-header {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--colour-surface);
}

.site-logo-link {
  grid-column: 2;
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
}

.site-header-nav {
  grid-column: 3;
  justify-self: end;
}

@media (min-width: 64rem) {
  .site-header {
    display: flex;
    justify-content: space-between;
    padding-block: var(--space-5);
  }
}
</style>

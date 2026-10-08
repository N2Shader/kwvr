<template>
  <a
    href="#main"
    class="skip-link"
  >Skip to main content</a>
  <NuxtRouteAnnouncer />
  <SiteHeader />
  <main
    id="main"
    class="site-main"
    tabindex="-1"
  >
    <NuxtPage />
  </main>
  <SiteFooter />
</template>

<style scoped>
/* Grows to fill the space between header and footer */
.site-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

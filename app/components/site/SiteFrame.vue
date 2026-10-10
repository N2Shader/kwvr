<template>
  <UApp :toaster="null">
    <!--
      The site shell, shared by app.vue and error.vue (Nuxt renders error.vue instead of app.vue).
      UApp holds Nuxt UI's providers and renders no wrapper element. No toasts, so no toaster region.
    -->
    <a
      href="#main"
      class="skip-link"
    >Skip to main content</a>
    <NuxtRouteAnnouncer />
    <!--
      The boxed site: header, page and footer stop at --ui-container (80rem) on wide screens, centred,
      and their backgrounds stop at its edge. The skip link and route announcer stay outside (absolutely positioned).
    -->
    <UContainer class="site-frame">
      <SiteHeader />
      <main
        id="main"
        class="site-main"
        tabindex="-1"
      >
        <slot />
      </main>
      <SiteFooter />
    </UContainer>
  </UApp>
</template>

<style scoped>
/* Grows to fill the viewport (#__nuxt). No gutter: the bands inside fill the box, their content has its own */
.site-frame {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-inline: 0;
}

/* Grows to fill the space between header and footer */
.site-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

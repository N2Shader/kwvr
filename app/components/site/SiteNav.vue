<script setup lang="ts">
const { primaryNav, donateLink } = useAppConfig()

const siteNavRef = ref<HTMLElement | null>(null)
const toggleButtonRef = ref<HTMLButtonElement | null>(null)

// Mobile menu state — on desktop the menu is always shown and the toggle is hidden.
// `isMenuOpen` drives aria-expanded and changes straight away; `isMenuRendered` keeps
// the panel displayed until the close animation has finished.
const isMenuOpen = ref(false)
const isMenuRendered = ref(false)

const { playMenuOpen, playMenuClose } = useSiteNavMenuMotion(siteNavRef, () => {
  isMenuRendered.value = isMenuOpen.value
})

const openMenu = () => {
  isMenuOpen.value = true
  isMenuRendered.value = true
  playMenuOpen()
}

const closeMenu = () => {
  isMenuOpen.value = false
  playMenuClose()
}

const toggleMenu = () => {
  if (isMenuOpen.value) closeMenu()
  else openMenu()
}

onKeyStroke('Escape', () => {
  if (!isMenuOpen.value) return
  closeMenu()
  toggleButtonRef.value?.focus()
})

onClickOutside(siteNavRef, closeMenu)

// Keep in sync with --bp-lg in tokens.css
const isDesktopViewport = useMediaQuery('(min-width: 64rem)')

// Don't leave the menu open (and hidden) after resizing to desktop
watch(isDesktopViewport, (isDesktop) => {
  if (isDesktop) closeMenu()
})
</script>

<template>
  <nav
    ref="siteNavRef"
    class="site-nav"
    aria-label="Main"
  >
    <button
      ref="toggleButtonRef"
      type="button"
      class="site-nav-toggle"
      :aria-expanded="isMenuOpen"
      aria-controls="site-nav-menu"
      @click="toggleMenu"
    >
      <span class="visually-hidden">Menu</span>
      <!-- Three bars drawn in CSS (no icon set yet); they fold into a cross when the menu opens -->
      <span
        class="site-nav-toggle-bars"
        aria-hidden="true"
      >
        <span class="site-nav-toggle-bar" />
        <span class="site-nav-toggle-bar" />
        <span class="site-nav-toggle-bar" />
      </span>
    </button>
    <div
      id="site-nav-menu"
      class="site-nav-menu"
      :class="{ 'is-open': isMenuRendered }"
    >
      <!-- Mobile panel background, kept separate so it can grow without stretching the links -->
      <span
        class="site-nav-menu-surface"
        aria-hidden="true"
      />
      <ul class="site-nav-list">
        <li
          v-for="navLink in primaryNav"
          :key="navLink.href"
          class="site-nav-menu-item"
        >
          <a
            :href="navLink.href"
            class="site-nav-link"
          >{{ navLink.label }}</a>
        </li>
      </ul>
      <a
        :href="donateLink.href"
        class="button-primary site-nav-menu-item"
      >{{ donateLink.label }}</a>
    </div>
  </nav>
</template>

<style scoped>
/* Mobile first: a toggle button opens a panel below the header */
.site-nav-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0;
  background: none;
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

/* Bars are separate spans so each one can move on its own */
.site-nav-toggle-bars {
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
}

.site-nav-toggle-bar {
  display: block;
  width: 1.5rem;
  height: 2px;
  background-color: var(--colour-text-nav);
}

/* Hidden with CSS only, so the links stay in the DOM */
.site-nav-menu {
  display: none;
}

.site-nav-menu.is-open {
  position: absolute;
  top: 100%;
  inset-inline: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-4);
  /* Keeps the surface (z-index -1) behind the links but inside the panel */
  isolation: isolate;
}

.site-nav-menu-surface {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: var(--colour-surface);
  border-bottom: 1px solid var(--colour-border);
  /* Grows out of the corner where the toggle sits */
  transform-origin: top right;
}

.site-nav-list {
  display: flex;
  flex-direction: column;
  padding: 0;
  list-style: none;
}

.site-nav-link {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  color: var(--colour-text-nav);
  /* Links inside a labelled <nav> aren't running text, so no underline is needed (WCAG 1.4.1) */
  text-decoration: none;
}

.site-nav-link:hover {
  text-decoration: underline;
}

@media (min-width: 64rem) {
  .site-nav-toggle,
  .site-nav-menu-surface {
    display: none;
  }

  .site-nav-menu,
  .site-nav-menu.is-open {
    position: static;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    padding: 0;
    border-bottom: 0;
  }

  .site-nav-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0 var(--space-4);
  }
}
</style>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isPageNotFound = computed(() => props.error.statusCode === 404)

useHead({
  title: () => isPageNotFound.value
    ? 'Page not found — Keighley & Worth Valley Railway'
    : 'Something went wrong — Keighley & Worth Valley Railway',
})

/*
 * The button is a real link to "/" (works before hydration, opens a tab on middle/modifier click).
 * A plain click clears the error instead: a router push to the route the error happened on wouldn't.
 */
const goHomeFromError = (event: MouseEvent) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }
  event.preventDefault()
  clearError({ redirect: '/' })
}
</script>

<template>
  <SiteFrame>
    <UContainer
      as="section"
      class="error-page"
      aria-labelledby="error-page-title"
    >
      <!-- kwvr.co.uk's 404, with its search form swapped for a way home -->
      <header>
        <h1 id="error-page-title">
          {{ isPageNotFound ? 'Oops! That page can’t be found.' : 'Sorry, something went wrong.' }}
        </h1>
      </header>
      <p>
        {{ isPageNotFound ? 'It looks like nothing was found at this location.' : 'Please try again in a moment.' }}
      </p>
      <UButton
        to="/"
        label="Take me home please"
        class="button-primary"
        @click="goHomeFromError"
      />
    </UContainer>
  </SiteFrame>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
  padding-block: var(--space-8);
  text-align: left;
  background-color: var(--colour-surface);
}

.error-page > * {
  max-width: 40rem;
}
</style>

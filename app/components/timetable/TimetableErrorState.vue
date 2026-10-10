<script setup lang="ts">
const emit = defineEmits<{
  'return-home': []
}>()

const headingId = useId()

// Resized WebP copies of the 960px original (white already made transparent), never wider than it
const illustrationSrc = '/images/derailed-train.webp'
const illustrationWidths = [320, 480, 640, 960]
const imageUrlBuilder = useImage()

const illustrationSrcset = illustrationWidths
  .map(width => `${imageUrlBuilder(illustrationSrc, { width, format: 'webp' })} ${width}w`)
  .join(', ')
</script>

<template>
  <section
    class="error-state"
    :aria-labelledby="headingId"
  >
    <!-- The search failed: a derailed train, what happened, and a way back to the station cards -->
    <UContainer class="error-state-content">
      <!-- Decorative: the heading and the message carry the meaning -->
      <img
        :src="imageUrlBuilder(illustrationSrc, { width: 640, format: 'webp' })"
        :srcset="illustrationSrcset"
        sizes="(min-width: 40rem) 20rem, 16rem"
        alt=""
        width="960"
        height="1056"
        loading="lazy"
        decoding="async"
        class="error-state-image"
      >
      <h2 :id="headingId">
        Sorry, we couldn’t load the timetable
      </h2>
      <p class="error-state-message">
        Something went wrong on our side while finding train times. Please try again in a moment.
      </p>
      <!-- A button, not a link: we're already on "/", so a route change would do nothing -->
      <UButton
        label="Take me home please"
        class="button-primary"
        @click="emit('return-home')"
      />
    </UContainer>
  </section>
</template>

<style scoped>
.error-state {
  /* Grows to fill the page's content area (at least one screen tall), like the first-use state */
  flex: 1;
  padding-block: var(--space-6) var(--space-8);
  background-color: var(--colour-surface-alt);
}

/* Short snippets only, so centred (brand rule) */
.error-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}

.error-state-image {
  width: 100%;
  max-width: 16rem;
  height: auto;
  margin-block-end: var(--space-2);
}

.error-state-message {
  max-width: 36rem;
}

@media (min-width: 40rem) {
  .error-state-image {
    max-width: 20rem;
  }
}
</style>

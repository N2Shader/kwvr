<script setup lang="ts">
// The layout shared by the results area's message states (error, no results): a decorative illustration,
// a heading, a short message and a way back to the station cards. Each state sets its illustration's
// display width through `--illustrated-state-image-max-width` (portrait and landscape art differ).
const props = defineProps<{
  heading: string
  message: string
  illustrationSrc: string
  illustrationWidth: number
  illustrationHeight: number
  illustrationSizes: string
}>()

const emit = defineEmits<{
  'return-home': []
}>()

const headingId = useId()

// Resized WebP copies of the original (white already made transparent), never wider than it
const illustrationWidths = [320, 480, 640, 960]
const imageUrlBuilder = useImage()

const illustrationSrcset = computed(() => illustrationWidths
  .filter(width => width <= props.illustrationWidth)
  .map(width => `${imageUrlBuilder(props.illustrationSrc, { width, format: 'webp' })} ${width}w`)
  .join(', '))
</script>

<template>
  <section
    class="illustrated-state"
    :aria-labelledby="headingId"
  >
    <UContainer class="illustrated-state-content">
      <!-- Decorative: the heading and the message carry the meaning -->
      <img
        :src="imageUrlBuilder(illustrationSrc, { width: 640, format: 'webp' })"
        :srcset="illustrationSrcset"
        :sizes="illustrationSizes"
        alt=""
        :width="illustrationWidth"
        :height="illustrationHeight"
        loading="lazy"
        decoding="async"
        class="illustrated-state-image"
      >
      <h2 :id="headingId">
        {{ heading }}
      </h2>
      <p class="illustrated-state-message">
        {{ message }}
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
.illustrated-state {
  /* Grows to fill the page's content area down to the footer on a short page, like the first-use state */
  flex: 1;
  padding-block: var(--space-6) var(--space-8);
  background-color: var(--colour-surface-alt);
}

/* Short snippets only, so centred (brand rule) */
.illustrated-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}

.illustrated-state-image {
  width: 100%;
  max-width: var(--illustrated-state-image-max-width, 16rem);
  height: auto;
  margin-block-end: var(--space-2);
}

.illustrated-state-message {
  max-width: 36rem;
}
</style>

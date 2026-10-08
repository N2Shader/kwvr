<template>
  <section class="empty-state">
    <p class="empty-state-message">
      Nothing to show here yet
    </p>
  </section>
</template>

<style scoped>
.empty-state {
  /* Grows to fill the viewport on tall screens; min-height is the floor */
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 20rem;
  padding: var(--space-8) var(--space-4);
  background-color: var(--colour-surface-alt);
}

.empty-state-message {
  font-size: var(--font-size-xl);
  text-align: center;
}
</style>

<script setup lang="ts">
const { contact, legalLinks, organisation, socialLinks } = useAppConfig()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-organisation surface-inverse">
      <p class="footer-organisation-name">
        &copy; {{ organisation.name }}
      </p>
      <p class="footer-registration">
        ({{ organisation.registration }})
      </p>
      <address class="footer-contact">
        <p>Telephone: <a :href="contact.telephone.href">{{ contact.telephone.label }}</a></p>
        <p>Email: <a :href="contact.email.href">{{ contact.email.label }}</a></p>
      </address>
    </div>

    <div class="footer-links surface-inverse">
      <div class="footer-links-inner container">
        <nav aria-label="Legal">
          <ul class="footer-link-list legal-list">
            <li
              v-for="legalLink in legalLinks"
              :key="legalLink.href"
            >
              <a :href="legalLink.href">{{ legalLink.label }}</a>
            </li>
          </ul>
        </nav>
        <ul
          class="footer-link-list social-list"
          aria-label="Social media"
        >
          <li
            v-for="socialLink in socialLinks"
            :key="socialLink.href"
          >
            <a
              :href="socialLink.href"
              class="social-link"
            >
              <UIcon
                :name="socialLink.icon"
                class="social-icon"
                aria-hidden="true"
              />
              <span class="visually-hidden">{{ socialLink.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-organisation {
  padding: var(--space-6) var(--space-4) var(--space-4);
  text-align: center;
  background-color: var(--colour-primary);
}

.footer-organisation-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.footer-registration {
  margin-top: var(--space-1);
  font-size: var(--font-size-sm);
}

/* Telephone left, email right; wraps to a stack when there isn't room */
.footer-contact {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0 var(--space-5);
  margin-top: var(--space-5);
  font-size: var(--font-size-sm);
  font-style: normal;
  text-align: start;
}

/* Padding lifts the inline links to a 24px+ target */
.footer-contact a {
  display: inline-block;
  padding-block: var(--space-1);
}

.footer-links {
  padding-block: var(--space-1);
  background-color: var(--colour-surface-inverse);
}

.footer-links-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0 var(--space-6);
}

.footer-link-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--space-5);
  padding: 0;
  list-style: none;
}

.footer-link-list a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
}

.legal-list {
  gap: 0 var(--space-2);
}

/* Links inside a labelled <nav> aren't running text, so no underline is needed (WCAG 1.4.1) */
.legal-list a {
  text-decoration: none;
}

.legal-list a:hover {
  text-decoration: underline;
}

.social-list {
  gap: 0 var(--space-2);
}

/* Square 44px target around a 24px logo */
.social-link {
  justify-content: center;
  min-width: 2.75rem;
}

/* :deep() because the icon is rendered by Nuxt UI's UIcon */
.social-link :deep(.social-icon) {
  width: var(--space-5);
  height: var(--space-5);
}

/* Visual "-" separator, hidden from assistive tech (second declaration is the alt-text form) */
.legal-list li + li::before {
  content: '-';
  content: '-' / '';
  margin-inline-end: var(--space-2);
}
</style>

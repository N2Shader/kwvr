import type { ComputedRef } from 'vue'
import type { TimetableSearchCriteria } from '~/types/timetable'
import { railwayHomeHref, siteDescription, siteName, siteTitle } from '~/data/siteContent'

// `Haworth after 10:00 on 13 October 2026`: no clock involved, so the server and the browser agree
const formatSearchSubject = ({ origin, departingAfter }: TimetableSearchCriteria) =>
  `${origin.name} after ${formatClockTime(departingAfter)} on ${formatLongDate(departingAfter)}`

/**
 * The search page's head: its title and description (a search link's own, so a shared link previews as that
 * search and each history entry is named), link previews (Open Graph, X), the canonical link (every search
 * link is the home page to search engines), the Markdown twin for agents and the railway's JSON-LD.
 */
export const useTimetablePageSeo = (addressBarCriteria: ComputedRef<TimetableSearchCriteria | undefined>) => {
  const { public: { siteUrl } } = useRuntimeConfig()
  const { contact, organisation, socialLinks } = useAppConfig()

  const pageTitle = computed(() => addressBarCriteria.value
    ? `Trains from ${formatSearchSubject(addressBarCriteria.value)} — ${siteName}`
    : siteTitle)

  const pageDescription = computed(() => addressBarCriteria.value
    ? `Departures from ${formatSearchSubject(addressBarCriteria.value)} on the ${siteName}, with every stop.`
    : siteDescription)

  // The search's query, e.g. `?from=haworth&date=2026-10-13&time=10:00`, or nothing on the home page
  const pageQuery = computed(() => addressBarCriteria.value ? getSearchQueryStringByCriteria(addressBarCriteria.value) : '')

  // X doesn't reliably read og:image:alt, so it gets its own copy
  const previewImageAlt = 'The Worth Valley sign: white capitals on a burgundy totem'

  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    ogType: 'website',
    ogSiteName: siteName,
    ogLocale: 'en_GB',
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    // The address of what's shown (a search link previews as itself); the canonical link below is for search engines
    ogUrl: () => `${siteUrl}/${pageQuery.value}`,
    ogImage: `${siteUrl}/images/og-image.png`,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/png',
    ogImageAlt: previewImageAlt,
    twitterCard: 'summary_large_image',
    twitterImageAlt: previewImageAlt,
    // The railway's X account (its social link in data/siteLinks.ts), credited on previews
    twitterSite: '@WorthValley',
  })

  const organisationId = `${railwayHomeHref}#organization`
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organisationId,
        'name': siteName,
        'legalName': organisation.name,
        'url': railwayHomeHref,
        // Google wants a raster logo of at least 112px: the 180px home screen icon
        'logo': `${siteUrl}/apple-touch-icon.png`,
        'telephone': contact.telephone.href.replace('tel:', ''),
        'email': contact.email.href.replace('mailto:', ''),
        'sameAs': socialLinks.map(socialLink => socialLink.href),
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        'name': `${siteName} timetable`,
        'url': `${siteUrl}/`,
        'description': siteDescription,
        'inLanguage': 'en-GB',
        'publisher': { '@id': organisationId },
      },
    ],
  }

  useHead({
    link: [
      { rel: 'canonical', href: `${siteUrl}/` },
      // The same page as Markdown (with this search's departures), for agents: server/routes/index.md.ts
      { rel: 'alternate', type: 'text/markdown', href: () => `/index.md${pageQuery.value}` },
    ],
    script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(structuredData) }],
  })
}

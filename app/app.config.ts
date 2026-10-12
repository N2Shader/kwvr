import { siteLinks } from './data/siteLinks'

// Site-wide link data, read with `useAppConfig()`. The links themselves are in data/siteLinks.ts,
// so the server (Markdown for agents) can import them too.
export default defineAppConfig({
  // This app's home (the search page); the other links still mirror kwvr.co.uk
  homeHref: '/',
  ...siteLinks,
})

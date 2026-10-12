// Site-wide link data, mirroring https://kwvr.co.uk. The app reads it through `useAppConfig()` (app.config.ts
// spreads it in); the server's Markdown for agents (server/utils/siteMarkdown.ts) imports it from here.
export const siteLinks = {
  primaryNav: [
    { label: 'Accessibility', href: 'https://kwvr.co.uk/visiting-the-kwvr/accessibility/' },
    { label: 'Directions', href: 'https://kwvr.co.uk/visiting-the-kwvr/getting-here/' },
    { label: 'Fares', href: 'https://kwvr.co.uk/visiting-the-kwvr/fares/' },
    { label: 'Dogs', href: 'https://kwvr.co.uk/visiting-the-kwvr/dogs/' },
    { label: 'Food & drink', href: 'https://kwvr.co.uk/visiting-the-kwvr/food-drink/' },
  ],
  donateLink: { label: 'Donate', href: 'https://kwvr.co.uk/support/donate/' },
  legalLinks: [
    { label: 'Terms & Conditions', href: 'https://kwvr.co.uk/private/terms-and-conditions/' },
    { label: 'Privacy Policy', href: 'https://kwvr.co.uk/private/privacy-policy/' },
  ],
  // Shown as brand logos (Simple Icons, bundled locally); `label` is the link's accessible name.
  // Keep the icon names in sync with `icon.clientBundle.icons` in nuxt.config.ts.
  socialLinks: [
    { label: 'Facebook', href: 'https://www.facebook.com/WorthValleyRailway', icon: 'i-simple-icons-facebook' },
    // Still "Twitter" on kwvr.co.uk; the platform's current logo is the X mark
    { label: 'X (formerly Twitter)', href: 'https://twitter.com/WorthValley', icon: 'i-simple-icons-x' },
    { label: 'Instagram', href: 'https://www.instagram.com/worthvalleyrailway', icon: 'i-simple-icons-instagram' },
    { label: 'YouTube', href: 'https://www.youtube.com/c/KwvrUkRailway', icon: 'i-simple-icons-youtube' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@worthvalleyrailway', icon: 'i-simple-icons-tiktok' },
  ],
  contact: {
    telephone: { label: '01535 645214', href: 'tel:+441535645214' },
    email: { label: 'admin@kwvr.co.uk', href: 'mailto:admin@kwvr.co.uk' },
  },
  organisation: {
    name: 'Keighley and Worth Valley Railway Preservation Society Limited',
    registration: 'Company registered in England No. 07135945, Charity registration No. 1136853',
  },
}

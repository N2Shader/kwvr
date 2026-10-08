// Site-wide link data, read with `useAppConfig()`. Values mirror https://kwvr.co.uk.
export default defineAppConfig({
  homeHref: 'https://kwvr.co.uk/',
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
  socialLinks: [
    { label: 'Facebook', href: 'https://www.facebook.com/WorthValleyRailway' },
    { label: 'Twitter', href: 'https://twitter.com/WorthValley' },
    { label: 'Instagram', href: 'https://www.instagram.com/worthvalleyrailway' },
    { label: 'YouTube', href: 'https://www.youtube.com/c/KwvrUkRailway' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@worthvalleyrailway' },
  ],
  contact: {
    telephone: { label: '01535 645214', href: 'tel:+441535645214' },
    email: { label: 'admin@kwvr.co.uk', href: 'mailto:admin@kwvr.co.uk' },
  },
  organisation: {
    name: 'Keighley and Worth Valley Railway Preservation Society Limited',
    registration: 'Company registered in England No. 07135945, Charity registration No. 1136853',
  },
})

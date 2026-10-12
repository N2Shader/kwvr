// The site's name and descriptions, in one place: the page head and link previews (nuxt.config.ts,
// useTimetablePageSeo) and the Markdown for agents (server/utils). No imports, so nuxt.config.ts can load it.

export const siteName = 'Keighley & Worth Valley Railway'

export const siteTitle = `Find train times — ${siteName}`

// Search results' snippet (about 150 characters)
export const siteDescription = 'Find Keighley & Worth Valley Railway train times: departures from Keighley, Ingrow West, Damems, Oakworth, Haworth and Oxenhope, with every stop.'

// One line about the railway, for llms.txt and the Markdown pages
export const siteSummary = 'Train times for the Keighley & Worth Valley Railway, a heritage railway in West Yorkshire that runs 4¾ miles from Keighley to Oxenhope.'

// The railway's own site, which this timetable sits beside
export const railwayHomeHref = 'https://kwvr.co.uk/'

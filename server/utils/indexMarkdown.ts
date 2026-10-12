import type { LocationQuery } from 'vue-router'
import { placeholderStations } from '~/data/placeholderTimetable'
import { getSearchCriteriaByRouteQuery } from '~/utils/searchRouteQuery'
import { getTrainServicesByCriteria } from '~/utils/timetableResponse'
import { buildDeparturesErrorMarkdown, buildDeparturesMarkdown } from './departuresMarkdown'
import { buildHomeMarkdown } from './siteMarkdown'
import { fetchTimetableByQuery } from './timetableApi'

interface IndexMarkdown {
  markdown: string
  statusCode: number
}

/**
 * The search page as Markdown for the address's query, like the page itself: a search
 * (`?from=haworth&date=2026-10-13&time=10:00`) gets its departures, from the same API call and the same rows
 * as the page; no search (or one that doesn't hold up: an unknown station, a date that doesn't exist) gets
 * the home page. A failed API call is a 502, like the search endpoint. No clock: a past day still answers.
 */
export const getIndexMarkdownByQuery = async (routeQuery: LocationQuery, siteUrl: string): Promise<IndexMarkdown> => {
  const criteria = getSearchCriteriaByRouteQuery(routeQuery, placeholderStations)
  if (!criteria) return { markdown: buildHomeMarkdown(siteUrl), statusCode: 200 }

  try {
    const timetableResponse = await fetchTimetableByQuery({ originId: criteria.origin.id, departingAfter: criteria.departingAfter })
    return { markdown: buildDeparturesMarkdown(siteUrl, criteria, getTrainServicesByCriteria(timetableResponse, criteria)), statusCode: 200 }
  }
  catch (error) {
    console.error('Timetable API request failed', error)
    return { markdown: buildDeparturesErrorMarkdown(siteUrl, criteria), statusCode: 502 }
  }
}

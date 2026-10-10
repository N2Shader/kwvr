// The search box's endpoint: passes the search (`originId`, `departingAfter`) to the external timetable API
// (fetchTimetableByQuery) and returns its answer. If the API fails, so does this endpoint, with a 502, and
// the page shows the error state (useTimetableSearch). The API's own error stays in the server log.

// TEMPORARY: holds the answer, to check the loading skeleton and its swap to the results. Remove before committing
const SKELETON_CHECK_DELAY_MS = 500

export default defineEventHandler(async (event) => {
  const { originId, departingAfter } = getQuery(event)
  await new Promise(resolve => setTimeout(resolve, SKELETON_CHECK_DELAY_MS))

  try {
    return await fetchTimetableByQuery({ originId: String(originId ?? ''), departingAfter: String(departingAfter ?? '') })
  }
  catch (error) {
    console.error('Timetable API request failed', error)
    // 502 Bad Gateway: our server is fine, the API behind it isn't. Its details aren't sent to the browser
    throw createError({ statusCode: 502, statusMessage: 'Timetable API request failed' })
  }
})

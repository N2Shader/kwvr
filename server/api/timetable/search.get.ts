import dummyTimetableResponse from '../../data/dummy-timetable-response.json'

// The search box's endpoint. It will call the external timetable API (not built yet) and return its services;
// until then it returns a dummy response (the orange timetable, whole). The query carries `originId` and
// `departingAfter`, ignored for now: the front end picks the matching services (getTrainServicesByCriteria).

// TEMPORARY: holds the answer for 5s, to check the loading skeleton and its swap to the results. Remove before committing
const SKELETON_CHECK_DELAY_MS = 500

export default defineEventHandler(async () => {
  await new Promise(resolve => setTimeout(resolve, SKELETON_CHECK_DELAY_MS))
  return dummyTimetableResponse
})

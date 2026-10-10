import dummyTimetableResponse from '../../data/dummy-timetable-response.json'

// The search box's endpoint. It will call the external timetable API (not built yet) and return its services;
// until then it returns a dummy response (the yellow timetable, whole). The query carries `originId` and
// `departingAfter`, ignored for now: the front end picks the matching services (getTrainServicesByCriteria).
export default defineEventHandler(() => dummyTimetableResponse)

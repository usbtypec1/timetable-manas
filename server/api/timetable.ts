const isFulfilled = <T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> =>
  result.status === 'fulfilled'

const parseCourseIds = (queryParams: Record<string, unknown>): number[] => {
  if (typeof queryParams.courseId === 'string') {
    return [parseInt(queryParams.courseId)]
  }
  if (Array.isArray(queryParams.courseId)) {
    return queryParams.courseId.map(Number)
  }
  throw createError({ statusCode: 400, statusMessage: 'Invalid query param: courseId' })
}

// Cached at the edge so repeated requests for the same course selection (the common case,
// since the search page always requests the same fixed chunks) don't re-scrape the upstream
// site or re-invoke the function — this is what was driving the Vercel edge request/usage spike.
export default defineCachedEventHandler(async (event) => {
  const courseIds = parseCourseIds(getQuery(event))

  const settledResponses = await Promise.allSettled(courseIds.map(fetchAndParseTimetable))
  const responses = settledResponses.filter(isFulfilled).map(result => result.value)

  return mergeTimetables(responses.flat())
}, {
  maxAge: 60 * 60,
  swr: true,
  getKey: (event) => {
    const raw = getQuery(event).courseId
    const ids = Array.isArray(raw) ? raw : raw !== undefined ? [raw] : []
    return ids.map(String).sort().join(',')
  },
})

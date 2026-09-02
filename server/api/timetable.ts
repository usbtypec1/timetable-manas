const isFulfilled = <T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> =>
  result.status === 'fulfilled'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  let courseIds
  if (typeof queryParams.courseId === 'string') {
    courseIds = [parseInt(queryParams.courseId)]
  } else if (Array.isArray(queryParams.courseId)) {
    courseIds = queryParams.courseId.map(Number)
  } else {
    throw new Error('Invalid query param')
  }

  const settledResponses = await Promise.allSettled(courseIds.map(fetchAndParseTimetable))
  const responses = settledResponses.filter(isFulfilled).map((result) => result.value)

  return mergeTimetables(responses.flat())
})

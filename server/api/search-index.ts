import { parseLessonName } from '~/utils/lesson-name'
import { weekdayOptions } from '~/utils/weekdays'
import { searchIndexChunks } from '~/utils/search-index-chunks'
import type { SearchableLesson } from '~/types/search'

const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const

const weekdayToLabel: Record<string, string> = Object.fromEntries(
  weekdayOptions.map(({ value, label }) => [value, label]),
)

const parseChunkIndex = (queryParams: Record<string, unknown>): number => {
  const raw = queryParams.chunk
  const index = typeof raw === 'string' ? Number.parseInt(raw, 10) : NaN

  if (!Number.isInteger(index) || index < 0 || index >= searchIndexChunks.length) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid query param: chunk' })
  }

  return index
}

// Builds one chunk of the search catalogue, fetching every course in it fully in parallel
// (single round, no queueing) so a request stays well under Vercel's function timeout, and
// caches the result at the edge — so most visitors never trigger a re-scrape at all. The
// client requests all chunks (see /pages/search.vue) instead of one course at a time, which
// is what was driving the Vercel edge request spike.
export default defineCachedEventHandler(async (event) => {
  const chunkIndex = parseChunkIndex(getQuery(event))
  const courses = searchIndexChunks[chunkIndex]
  const courseInfoById = new Map(courses.map(course => [course.courseId, course]))

  const timetablesByCourse = await Promise.all(
    courses.map(async (course) => {
      try {
        return await fetchAndParseTimetable(course.courseId)
      }
      catch {
        return []
      }
    }),
  )

  const lessons: SearchableLesson[] = []

  for (const periodTimetables of timetablesByCourse) {
    for (const periodTimetable of periodTimetables) {
      for (const weekday of WEEKDAY_KEYS) {
        for (const lesson of periodTimetable[weekday] ?? []) {
          const course = courseInfoById.get(lesson.courseId)
          if (!course) {
            continue
          }

          const { code, title } = parseLessonName(lesson.name)

          lessons.push({
            code,
            title,
            teacherName: lesson.teacherName,
            location: lesson.location,
            type: lesson.type,
            weekday,
            weekdayLabel: weekdayToLabel[weekday],
            period: periodTimetable.period,
            courseId: course.courseId,
            courseNumber: course.courseNumber,
            departmentName: course.departmentName,
            facultyName: course.facultyName,
          })
        }
      }
    }
  }

  return lessons
}, {
  maxAge: 60 * 60 * 3,
  swr: true,
  getKey: event => String(parseChunkIndex(getQuery(event))),
})

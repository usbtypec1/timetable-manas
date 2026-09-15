import faculties from '~/assets/faculties.json'

export interface SearchIndexCourseInfo {
  courseId: number
  courseNumber: number
  departmentName: string
  facultyName: string
}

// Each chunk is fetched by the server fully in parallel (no internal queueing), so its size
// must keep a single request safely under Vercel's function timeout — 25 concurrent upstream
// scrapes, bounded by the existing per-course timeout, comfortably fits in 10s.
export const SEARCH_INDEX_CHUNK_SIZE = 25

const getAllCourses = (): SearchIndexCourseInfo[] => {
  const courses: SearchIndexCourseInfo[] = []

  for (const faculty of faculties) {
    for (const department of faculty.departments) {
      for (const course of department.courses) {
        courses.push({
          courseId: course.id,
          courseNumber: course.number,
          departmentName: department.name,
          facultyName: faculty.name,
        })
      }
    }
  }

  return courses
}

export const searchIndexChunks: SearchIndexCourseInfo[][] = (() => {
  const courses = getAllCourses()
  const chunks: SearchIndexCourseInfo[][] = []
  for (let i = 0; i < courses.length; i += SEARCH_INDEX_CHUNK_SIZE) {
    chunks.push(courses.slice(i, i + SEARCH_INDEX_CHUNK_SIZE))
  }
  return chunks
})()

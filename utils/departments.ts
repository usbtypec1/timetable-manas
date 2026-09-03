import type { Faculty } from '~/types/faculties'

export const courseIdToDepartmentName = (faculties: Faculty[]): Record<string, string> => {
  const result: Record<string, string> = {}

  for (const { departments } of faculties) {
    for (const department of departments) {
      for (const course of department.courses) {
        result[course.id] = department.name
      }
    }
  }

  return result
}

import { Faculty } from '~/types/faculties'
import faculties from 'assets/faculties.json'

export const getFaculties = (): Faculty[] => faculties

export const getDepartmentNameByCourseId = (courseId: number): string | undefined => {
  for (const { departments } of getFaculties()) {
    for (const department of departments) {
      for (const course of department.courses) {
        if (course.id === courseId) {
          return department.name
        }
      }
    }
  }
}

export const getDepartmentNameAndCourseNumberByCourseId = (courseId: number): {
  departmentName: string,
  courseNumber: number,
  courseId: number
} | undefined => {
  for (const { departments } of getFaculties()) {
    for (const department of departments) {
      for (const course of department.courses) {
        if (course.id === courseId) {
          return {
            departmentName: department.name,
            courseNumber: course.number,
            courseId: course.id
          }
        }
      }
    }
  }
}
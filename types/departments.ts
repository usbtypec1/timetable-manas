import type { Course } from '~/types/courses'

export interface Department {
  id: string
  name: string
  courses: Course[]
}

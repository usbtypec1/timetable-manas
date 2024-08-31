import type { Department } from '~/types/departments'

export enum Weekday {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
}

export interface DepartmentSchedule {
  department: Department
  weekday: Weekday
  lessonIndex: number
}

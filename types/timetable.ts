export interface Lesson {
  courseId: number
  name: string
  teacherName: string
  location: string
  type: number
}

export interface PeriodTimetable {
  period: string
  monday: Lesson[]
  tuesday: Lesson[]
  wednesday: Lesson[]
  thursday: Lesson[]
  friday: Lesson[]
}

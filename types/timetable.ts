export interface Period {
  start: string
  end: string
}

export interface Lesson {
  courseId: number
  name: string
  teacherName: string
  location: string
  type: number
}

export interface PeriodTimetable {
  period: Period
  monday: Lesson[]
  tuesday: Lesson[]
  wednesday: Lesson[]
  thursday: Lesson[]
  friday: Lesson[]
}
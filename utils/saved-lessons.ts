import type { Lesson } from '~/types/timetable'

export const getLessonKey = (lesson: Lesson): string =>
  [lesson.courseId, lesson.type, lesson.name, lesson.teacherName, lesson.location].join('::')

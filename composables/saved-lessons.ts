import { useStorage } from '@vueuse/core'
import type { Lesson } from '~/types/timetable'
import { getLessonKey } from '~/utils/saved-lessons'

export interface SavedLessonEntry {
  key: string
  courseId: number
  lesson: Lesson
}

const useSavedLessons = (storageKey: string) => {
  const items = useStorage<SavedLessonEntry[]>(storageKey, [])

  const has = (lesson: Lesson): boolean => {
    const key = getLessonKey(lesson)
    return items.value.some(entry => entry.key === key)
  }

  const add = (lesson: Lesson): void => {
    const key = getLessonKey(lesson)
    if (items.value.some(entry => entry.key === key)) {
      return
    }
    items.value = [...items.value, { key, courseId: lesson.courseId, lesson }]
  }

  const remove = (key: string): void => {
    items.value = items.value.filter(entry => entry.key !== key)
  }

  const toggle = (lesson: Lesson): void => {
    const key = getLessonKey(lesson)
    if (items.value.some(entry => entry.key === key)) {
      remove(key)
    }
    else {
      add(lesson)
    }
  }

  return { items, has, add, remove, toggle }
}

export const useFavoriteLessons = () => useSavedLessons('favoriteLessons')
export const useHiddenLessons = () => useSavedLessons('hiddenLessons')

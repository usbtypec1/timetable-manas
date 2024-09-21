import { useStorage } from '@vueuse/core'

export const useCoursesHistory = ({ maxSize = 3 }: { maxSize: number }) => {
  const history = useStorage<number[]>('coursesHistory', [])

  const push = (courseId: number) => {
    if (history.value.includes(courseId)) {
      history.value = history.value.filter((v) => v !== courseId)
    }
    history.value.push(courseId)
    if (history.value.length > maxSize) {
      history.value.shift()
    }
  }

  const clear = () => history.value = []

  return {
    history,
    push,
    clear,
  }
}
import { useStorage } from '@vueuse/core'

interface Settings {
  isCoursesHistoryVisible: boolean
  isTeacherNamesVisible: boolean
  isLocationsVisible: boolean
  textSize: string
}

const defaultSettings: Settings = {
  isCoursesHistoryVisible: true,
  isTeacherNamesVisible: true,
  isLocationsVisible: true,
  textSize: 'text-sm',
}

export const useSettings = () => {
  const settings = useStorage('settings', defaultSettings)

  const update = (newSettings: Partial<Settings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  return { settings, update }
}
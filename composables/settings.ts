import { useStorage } from '@vueuse/core'

interface Settings {
  isLastViewedCoursesVisible: boolean
}

const defaultSettings: Settings = {
  isLastViewedCoursesVisible: true,
}

export const useSettings = () => {
  const settings = useStorage('settings', defaultSettings)

  const reset = () => settings.value = { ...defaultSettings }

  const update = (newSettings: Partial<Settings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  return { settings, reset, update }
}
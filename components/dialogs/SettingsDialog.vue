<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    header="Настройки"
    class="w-full sm:max-w-96 mx-6"
  >
    <ToggleSwitchWithLabel
      v-model="isCoursesHistoryVisible"
      label="Быстрый просмотр"
    />
    <ToggleSwitchWithLabel
      v-model="isTeacherNamesVisible"
      label="Имена преподавателей"
    />
    <ToggleSwitchWithLabel
      v-model="isLocationsVisible"
      label="Аудитории"
    />
    <Button
      label="Очистить историю"
      :icon="cleanHistoryIcon"
      class="mb-2"
      text
      @click="onClearHistory"
    />
    <div class="flex justify-end gap-3">
      <Button type="button" label="Отменить" severity="secondary" @click="isVisible = false"></Button>
      <Button type="button" label="Сохранить" @click="onSaveSettings"/>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import ToggleSwitchWithLabel from '~/components/ToggleSwitchWithLabel.vue'

const isVisible = defineModel<boolean>('isVisible')

const { settings, update } = useSettings()
const { clear: clearHistory } = useCoursesHistory({ maxSize: 3 })

const cleanHistoryIcon = ref<string>('pi pi-trash')

const onClearHistory = () => {
  cleanHistoryIcon.value = 'pi pi-check'
  clearHistory()
  setTimeout(() => {
    cleanHistoryIcon.value = 'pi pi-trash'
  }, 1000)
}

const isCoursesHistoryVisible = ref<boolean>(settings.value.isCoursesHistoryVisible)
const isTeacherNamesVisible = ref<boolean>(settings.value.isTeacherNamesVisible)
const isLocationsVisible = ref<boolean>(settings.value.isLocationsVisible)

const onSaveSettings = () => {
  update({
    isCoursesHistoryVisible: isCoursesHistoryVisible.value,
    isTeacherNamesVisible: isTeacherNamesVisible.value,
    isLocationsVisible: isLocationsVisible.value,
  })
  isVisible.value = false
}
</script>

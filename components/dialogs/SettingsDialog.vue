<template>
  <Dialog v-model:visible="isVisible" modal header="Настройки" :style="{ width: '25rem' }">
    <div class="flex items-center gap-x-2 mb-4">
      <ToggleSwitch
        v-model="isLastViewedCoursesVisible"
        :input-id="isLastViewedCoursesVisibleInputId"
      />
      <label
        class="font-semibold"
        :for="isLastViewedCoursesVisibleInputId"
      >
        Быстрый просмотр
      </label>
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" label="Отменить" severity="secondary" @click="isVisible = false"></Button>
      <Button type="button" label="Сохранить" @click="onSaveSettings"/>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
const isVisible = defineModel<boolean>('isVisible')

const isLastViewedCoursesVisibleInputId = useId()

const isLastViewedCoursesVisible = useState('isLastViewedCoursesVisible', () => false)

const { update } = useSettings()

const onSaveSettings = () => {
  update({
    isLastViewedCoursesVisible: isLastViewedCoursesVisible.value,
  })
  isVisible.value = false
}
</script>

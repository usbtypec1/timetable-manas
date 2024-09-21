<template>
  <Dialog v-model:visible="isVisible" modal header="Настройки" :style="{ width: '25rem' }">
    <ToggleSwitchWithLabel
      v-model="isLastViewedCoursesVisible"
      label="Быстрый просмотр"
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

const isLastViewedCoursesVisible = useState('isLastViewedCoursesVisible', () => false)

const { update } = useSettings()

const onSaveSettings = () => {
  update({
    isLastViewedCoursesVisible: isLastViewedCoursesVisible.value,
  })
  isVisible.value = false
}
</script>

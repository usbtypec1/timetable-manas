<template>
  <div
    class=""
  >
    <label>{{ faculty.name }}</label>
    <Checkbox v-model="isShown" :value="isShown"/>

    <div v-if="isShown">
      <div
        v-for="department in faculty.departments"
        :key="department.id"
      >
        <label :for="department.id">
          {{ department.name }}
        </label>
        <Checkbox v-model="selectedDepartmentIds" :value="department.id" :input-id="department.id"/>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Faculty } from '~/types/faculties'

const props = defineProps<{
  faculty: Faculty,
}>()

const isShown = ref<boolean>(false)

const selectedDepartmentIds = defineModel<number[]>('selectedDepartmentIds', {
  defaultValue: [],
})
</script>

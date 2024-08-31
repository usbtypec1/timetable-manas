<template>
  <Panel>
    <template #header>
      <div class="flex w-full justify-between items-center">
        <p class="text-lg font-semibold">{{ department.name }}</p>
        <Button
          @click="unselectDepartment(department.id)"
          icon="pi pi-times"
          rounded
          severity="danger"
          text
        />
      </div>
    </template>

    <div class="flex flex-col gap-y-2">
      <div v-for="course in department.courses" class="flex gap-x-2 items-center">
        <label :for="course.id">Курс: {{ course.number }}</label>
        <Checkbox
          :input-id="String(course.id)"
          :value="course.id"
          v-model="selectedCourseIds"
        />
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import type { Department } from '~/types/departments'

const props = defineProps<{
  department: Department,
}>()

const selectedCourseIds = defineModel<number[]>('selectedCourseIds')

const unselectDepartment = (departmentId: number): void => {
  selectedDepartments.value = selectedDepartments.value.filter((department: any) => department.id !== departmentId)
}
</script>

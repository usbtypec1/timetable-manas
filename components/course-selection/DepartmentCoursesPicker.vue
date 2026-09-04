<template>
  <Panel>
    <template #header>
      <div class="flex w-full justify-between items-center">
        <p class="text-lg font-semibold">
          {{ department.name }}
        </p>
        <Button
          icon="pi pi-times"
          rounded
          severity="danger"
          text
          @click="unselectDepartment(department.id)"
        />
      </div>
    </template>

    <div class="flex flex-col gap-y-2">
      <div
        v-for="course in department.courses"
        :key="course.id"
        class="flex gap-x-2 items-center"
      >
        <label
          class="w-14"
          :for="String(course.id)"
        >Курс: {{ course.number }}</label>
        <Checkbox
          v-model="selectedCourseIds"
          :input-id="String(course.id)"
          :value="course.id"
        />
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import type { Department } from '~/types/departments'

const props = defineProps<{
  department: Department
}>()

const selectedCourseIds = defineModel<number[]>('selectedCourseIds', { default: () => [] })
const selectedDepartments = defineModel<Department[]>('selectedDepartments', { default: () => [] })

const unselectDepartment = (departmentId: string): void => {
  selectedCourseIds.value = selectedCourseIds.value.filter(
    (courseId: number) => {
      return !props.department.courses.some(course => course.id === courseId)
    },
  )
  selectedDepartments.value = selectedDepartments.value.filter(
    (department: Department) => department.id !== departmentId,
  )
}
</script>

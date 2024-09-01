<template>
  <div class="mx-4 my-5">
    <Title>Манас | Расписание университета</Title>
    <ContactInfo/>

    <div class="flex flex-col md:flex-row gap-x-4 gap-y-2">
      <DepartmentsPickerListbox
        v-model:selected-departments="selectedDepartments"
        @clear="clearSelectedCourseIdsAndDepartments"
        :faculties="faculties"
      />
      <div class="grow grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-x-3 gap-y-2">
        <DepartmentCoursesPicker
          v-for="department in selectedDepartments"
          :department="department"
          :key="department.id"
          v-model:selected-course-ids="selectedCourseIds"
          v-model:selected-departments="selectedDepartments"
        />
      </div>
    </div>

    <LessonsTimetableSkeleton
      v-if="status === 'pending'"
    />
    <LessonsTimetable
      v-else-if="status === 'success'"
      :period-timetables="data"
      :course-id-to-department-name="courseIdToDepartmentName"
    />
  </div>
</template>

<script setup lang="ts">
import faculties from '~/assets/faculties.json'
import { useDebounceFn } from '@vueuse/core'
import DepartmentCoursesPicker from '~/components/DepartmentCoursesPicker.vue'
import type { Department } from '~/types/departments'
import LessonsTimetableSkeleton from '~/components/skeletons/LessonsTimetableSkeleton.vue'

const selectedDepartments = ref<Department[]>([])
const selectedCourseIds = ref<number[]>([])


const { data, refresh, status } = await useFetch('/api/timetable', {
  query: { courseId: selectedCourseIds },
  watch: false,
  immediate: false,
})

const clearSelectedCourseIdsAndDepartments = (): void => {
  selectedCourseIds.value = []
  selectedDepartments.value = []
  status.value = 'idle'
  data.value = null
  console.log(selectedDepartments.value, selectedCourseIds.value)
}

const debouncedFn = useDebounceFn(refresh, 1000)


watch([selectedCourseIds], async () => {
  if (selectedCourseIds.value.length > 0) {
    await debouncedFn()
  }
})

const courseIdToDepartmentName = computed(() => {
  const result: Record<string, [string, string]> = {}
  for (const faculty of faculties) {
    for (const department of faculty.departments) {
      for (const course of department.courses) {
        result[course.id] = `${course.number}-курс ${department.name}`
      }
    }
  }
  return result
})
</script>

<template>
  <div class="mx-4 my-5">
    <div class="text-center">
      <h1 class="text-3xl font-bold my-3">
        Улучшенное расписание университета Манас
      </h1>
      <span class="my-2 text-xl">Наш чат - <a class="text-violet-500" href="https://t.me/studmanas1"
                                              target="_blank">@studmanas1</a></span>
      <span>  |  </span>
      <span class="my-2 text-xl">Наш канал - <a class="text-violet-500" href="https://t.me/manashelp"
                                                target="_blank">@manashelp</a></span>
      <p class="my-2 text-xl">Разработчик - <a class="text-violet-500" href="https://t.me/usbtypec" target="_blank">@usbtypec</a>
      </p>
    </div>

    <div class="flex flex-col md:flex-row gap-x-4 gap-y-2">
      <div>
        <Listbox
          v-model="selectedDepartments"
          :options="faculties"
          @change="onChange"
          multiple
          optionLabel="name"
          class="w-full md:w-96"
          optionGroupLabel="name"
          optionGroupChildren="departments"
          filter
          checkmark
          filter-placeholder="Поиск по направлению"
        />
        <Button
          v-if="selectedDepartments.length > 0 || data"
          label="Очистить"
          outlined
          icon="pi pi-times"
          severity="danger"
          class="w-full mt-2"
          @click="clearSelectedCourseIdsAndDepartments"
        />
      </div>
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

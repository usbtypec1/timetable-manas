<template>
  <div class="mx-4 my-5">
    <div class="flex flex-col md:flex-row gap-x-4 gap-y-2">
      <DepartmentsPickerListbox
        v-model:selected-departments="selectedDepartments"
        :faculties="faculties"
        @clear="clearSelectedCourseIdsAndDepartments"
      />
      <div class="grow grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-x-3 gap-y-2">
        <DepartmentCoursesPicker
          v-for="department in selectedDepartments"
          :key="department.id"
          v-model:selected-course-ids="selectedCourseIds"
          v-model:selected-departments="selectedDepartments"
          :department="department"
        />
      </div>
    </div>

    <Message
      v-if="status === 'error'"
      severity="error"
      :closable="false"
      class="mt-4"
    >
      Произошла ошибка
    </Message>

    <template v-if="isMobileLayout">
      <DailyTimetable
        v-if="status === 'success'"
        v-model:force-desktop-view="forceDesktopView"
        :period-timetables="data ?? []"
        :course-id-to-department-name="courseIdToCourseLabel"
        :show-department-names="true"
        :colors-by-course="true"
      />
      <DailyTimetableSkeleton v-if="status === 'pending'" />
    </template>
    <template v-else>
      <LessonsTimetable
        v-if="status === 'success'"
        v-model:force-desktop-view="forceDesktopView"
        :period-timetables="data ?? []"
        :course-id-to-department-name="courseIdToCourseLabel"
        :show-department-names="true"
        :colors-by-course="true"
      />
      <LessonsTimetableSkeleton v-if="status === 'pending'" />
    </template>
  </div>
</template>

<script setup lang="ts">
import faculties from '~/assets/faculties.json'
import type { Department } from '~/types/departments'
import type { PeriodTimetable } from '~/types/timetable'

const selectedDepartments = ref<Department[]>([])
const selectedCourseIds = ref<number[]>([])

const { forceDesktopView, isMobileLayout } = useTimetableLayout()

const { data, refresh, status } = await useFetch<PeriodTimetable[]>('/api/timetable', {
  query: { courseId: selectedCourseIds },
  watch: false,
  immediate: false,
})

const clearSelectedCourseIdsAndDepartments = (): void => {
  selectedCourseIds.value = []
  selectedDepartments.value = []
  status.value = 'idle'
  data.value = null
}

const debouncedFn = useDebounceFn(refresh, 1000)

watch([selectedCourseIds], async () => {
  if (selectedCourseIds.value.length > 0) {
    await debouncedFn()
  }
})

const courseIdToCourseLabel = computed((): Record<string, string> => {
  const result: Record<string, string> = {}
  for (const faculty of faculties) {
    for (const department of faculty.departments) {
      for (const course of department.courses) {
        result[course.id] = `${course.number}-курс ${department.name}`
      }
    }
  }
  return result
})

useSeoMeta({
  title: 'Манас | Сравнить расписания',
  description: 'Сравните расписания нескольких направлений университета Манас одновременно.',
})
</script>

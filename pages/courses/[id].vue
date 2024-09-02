<template>
  <div>
    <p v-if="status === 'error'">Произошла ошибка</p>
    <template v-if="width <= 920 && !forceDesktopView">
      <DailyTimetable
        v-if="status === 'success'"
        :period-timetables="data"
        :course-id-to-department-name="courseIdToDepartmentName(faculties)"
        v-model:force-desktop-view="forceDesktopView"
        :department-name="departmentName"
        :show-department-names="false"
      />
    </template>
    <template v-else>
      <LessonsTimetable
        v-if="status === 'success'"
        :period-timetables="data"
        :course-id-to-department-name="courseIdToDepartmentName(faculties)"
        v-model:force-desktop-view="forceDesktopView"
        :department-name="departmentName"
        :show-department-names="false"
      />
    </template>

    <FloatingCornerButton
      severity="primary"
      page-name="index"
    />
  </div>
</template>

<script setup lang="ts">
import { courseIdToDepartmentName } from '~/services/departments'
import { useWindowSize } from '@vueuse/core'
import type { PeriodTimetable } from '~/types/timetable'
import { getDepartmentNameByCourseId, getFaculties } from '~/services/faculties'

const { width } = useWindowSize()

const { params } = useRoute()

const courseId = Number(params.id)

const departmentName = getDepartmentNameByCourseId(courseId)

const forceDesktopView = ref<boolean>(false)

const faculties = getFaculties()

const { data, status } = await useFetch<PeriodTimetable[]>('/api/timetable', {
  query: { courseId },
})
</script>

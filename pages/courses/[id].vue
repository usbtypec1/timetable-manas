<template>
  <div>
    <Message
      v-if="status === 'error'"
      severity="error"
      :closable="false"
      class="mb-4"
    >
      Произошла ошибка
    </Message>
    <template v-if="isMobileLayout">
      <DailyTimetable
        v-if="status === 'success'"
        v-model:force-desktop-view="forceDesktopView"
        :period-timetables="data ?? []"
        :course-id-to-department-name="courseIdToDepartmentName(faculties)"
        :department-name="departmentName"
        :show-department-names="false"
        :colors-by-course="false"
      />
    </template>
    <template v-else>
      <LessonsTimetable
        v-if="status === 'success'"
        v-model:force-desktop-view="forceDesktopView"
        :period-timetables="data ?? []"
        :course-id-to-department-name="courseIdToDepartmentName(faculties)"
        :department-name="departmentName"
        :show-department-names="false"
        :colors-by-course="false"
      />
    </template>

    <FloatingCornerButton
      severity="primary"
      page-name="index"
    />
  </div>
</template>

<script setup lang="ts">
import type { PeriodTimetable } from '~/types/timetable'
import { courseIdToDepartmentName } from '~/utils/departments'

const { params } = useRoute()

const courseId = Number(params.id)

const departmentName = getDepartmentNameByCourseId(courseId)

const { forceDesktopView, isMobileLayout } = useTimetableLayout()

const faculties = getFaculties()

const { data, status } = await useFetch<PeriodTimetable[]>('/api/timetable', {
  query: { courseId },
})

useSeoMeta({
  title: departmentName ? `Манас | Расписание — ${departmentName}` : 'Манас | Расписание',
  description: departmentName
    ? `Расписание занятий по направлению «${departmentName}» университета Манас.`
    : 'Расписание занятий университета Манас.',
})
</script>

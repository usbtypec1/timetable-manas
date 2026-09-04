<template>
  <section
    v-if="lastViewedCourses.length && settings.isCoursesHistoryVisible"
    class="flex flex-col gap-y-3 my-3"
  >
    <h3 class="font-semibold text-xl text-center">
      Быстрый просмотр
    </h3>
    <RecentCourseLink
      v-for="{ departmentName, courseNumber, courseId } in lastViewedCourses.toReversed()"
      :key="courseNumber"
      :department-name="departmentName"
      :course-number="courseNumber"
      :course-id="courseId"
    />
  </section>
</template>

<script setup lang="ts">
const { settings } = useSettings()

const { history: coursesHistory } = useCoursesHistory({ maxSize: 3 })

const lastViewedCourses = computed((): {
  departmentName: string
  courseNumber: number
  courseId: number
}[] => coursesHistory.value
  .map(courseId => getDepartmentNameAndCourseNumberByCourseId(courseId))
  .filter(course => course !== undefined))
</script>

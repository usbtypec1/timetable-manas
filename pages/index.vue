<template>
  <div>
    <NuxtLink :to="{ name: 'choose-course' }">
      <Button
        class="w-full mb-4"
        label="Выбрать курс"
        icon="pi pi-arrow-right"
        icon-pos="right"
      />
    </NuxtLink>

    <section
      v-if="favoriteLessons.length > 0"
      class="flex flex-col gap-y-3 mb-6"
    >
      <h3 class="font-semibold text-xl">
        Избранные уроки
      </h3>
      <div
        v-for="entry in favoriteLessons"
        :key="entry.key"
        class="shadow-md rounded px-3 py-2 flex justify-between items-start gap-2"
      >
        <NuxtLink
          :to="{ name: 'courses-id', params: { id: entry.courseId } }"
          class="min-w-0 grow"
        >
          <p class="font-semibold">
            {{ entry.lesson.name }}
          </p>
          <p
            v-if="courseLabel(entry.courseId)"
            class="text-sm text-gray-500"
          >
            {{ courseLabel(entry.courseId) }}
          </p>
          <p class="text-sm text-gray-500">
            {{ entry.lesson.teacherName }}
          </p>
          <p class="text-sm text-gray-500">
            {{ entry.lesson.location }}
          </p>
        </NuxtLink>
        <Button
          icon="pi pi-heart-fill"
          text
          rounded
          severity="danger"
          title="Убрать из избранного"
          @click="toggleFavorite(entry.lesson)"
        />
      </div>
    </section>

    <section
      v-if="lastViewedCourses.length && settings.isCoursesHistoryVisible"
      class="flex flex-col gap-y-3 my-3"
    >
      <h3 class="font-semibold text-xl text-center">
        Быстрый просмотр
      </h3>
      <NuxtLink
        v-for="{ departmentName, courseNumber, courseId } in lastViewedCourses.toReversed()"
        :key="courseNumber"
        :to="{ name: 'courses-id', params: { id: courseId } }"
      >
        <Button
          class=" w-full"
          severity="help"
          outlined
          :label="`${departmentName} - ${courseNumber} курс`"
        />
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
const { settings } = useSettings()

const { history: coursesHistory } = useCoursesHistory({ maxSize: 3 })

const { items: favoriteLessons, toggle: toggleFavorite } = useFavoriteLessons()

const lastViewedCourses = computed((): {
  departmentName: string
  courseNumber: number
  courseId: number
}[] => coursesHistory.value
  .map(courseId => getDepartmentNameAndCourseNumberByCourseId(courseId))
  .filter(course => course !== undefined))

const courseLabel = (courseId: number): string | undefined => {
  const info = getDepartmentNameAndCourseNumberByCourseId(courseId)
  return info ? `${info.departmentName} - ${info.courseNumber} курс` : undefined
}

useSeoMeta({
  title: 'Манас | Расписание',
  description: 'Улучшенное расписание университета Манас: избранные уроки и быстрый доступ к недавним курсам.',
})
</script>

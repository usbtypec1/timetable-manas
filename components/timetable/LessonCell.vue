<template>
  <div v-if="visibleLessons.length >= 1">
    <div
      v-for="lesson in visibleLessons"
      :key="getLessonKey(lesson)"
      class="shadow-md my-2 rounded px-3 py-2 flex justify-between items-start gap-2"
      :class="colorClassFor(lesson)"
    >
      <div class="min-w-0">
        <p
          v-if="showDepartmentNames"
          class="font-semibold mb-1"
        >
          {{ courseIdToDepartmentName[lesson.courseId] }}
        </p>
        <p>{{ lesson.name }}</p>
        <p v-if="settings.isTeacherNamesVisible">
          {{ lesson.teacherName }}
        </p>
        <p v-if="settings.isLocationsVisible">
          {{ lesson.location }}
        </p>
      </div>
      <div class="flex flex-col gap-y-1 shrink-0">
        <Button
          :icon="isFavorite(lesson) ? 'pi pi-heart-fill' : 'pi pi-heart'"
          rounded
          size="small"
          :severity="isFavorite(lesson) ? 'danger' : 'secondary'"
          title="Избранное"
          @click="toggleFavorite(lesson)"
        />
        <Button
          icon="pi pi-eye-slash"
          rounded
          size="small"
          severity="secondary"
          title="Скрыть урок"
          @click="toggleHidden(lesson)"
        />
      </div>
    </div>
  </div>
  <div v-else>
    нет данных
  </div>
</template>

<script setup lang="ts">
import type { Lesson } from '~/types/timetable'
import { getLessonKey } from '~/utils/saved-lessons'

const props = defineProps<{
  lessons: Lesson[] | undefined
  courseIdToDepartmentName: Record<string, string>
  showDepartmentNames: boolean
  colorClassFor: (lesson: Lesson) => string
}>()

const { settings } = useSettings()
const { has: isFavorite, toggle: toggleFavorite } = useFavoriteLessons()
const { has: isHidden, toggle: toggleHidden } = useHiddenLessons()

const visibleLessons = computed((): Lesson[] =>
  (props.lessons ?? []).filter(lesson => !isHidden(lesson)))
</script>

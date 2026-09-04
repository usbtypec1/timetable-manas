<template>
  <div class="shadow-md rounded px-3 py-2 flex justify-between items-start gap-2">
    <NuxtLink
      :to="{ name: 'courses-id', params: { id: entry.courseId } }"
      class="min-w-0 grow"
    >
      <p class="font-semibold">
        {{ entry.lesson.name }}
      </p>
      <p
        v-if="courseLabel"
        class="text-sm text-gray-500"
      >
        {{ courseLabel }}
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
      @click="$emit('unfavorite', entry.lesson)"
    />
  </div>
</template>

<script setup lang="ts">
import type { SavedLessonEntry } from '~/composables/saved-lessons'
import type { Lesson } from '~/types/timetable'

const props = defineProps<{
  entry: SavedLessonEntry
}>()

defineEmits<{
  unfavorite: [lesson: Lesson]
}>()

const courseLabel = computed((): string | undefined => {
  const info = getDepartmentNameAndCourseNumberByCourseId(props.entry.courseId)
  return info ? `${info.departmentName} - ${info.courseNumber} курс` : undefined
})
</script>

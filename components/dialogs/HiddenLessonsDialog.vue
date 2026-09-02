<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    header="Скрытые уроки"
    class="w-full sm:max-w-md mx-6"
  >
    <p v-if="lessons.length === 0" class="text-center text-gray-500">
      Нет скрытых уроков
    </p>
    <div
      v-for="lesson in lessons"
      :key="getLessonKey(lesson)"
      class="flex items-center justify-between gap-3 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
    >
      <div class="min-w-0">
        <p class="font-semibold truncate">{{ lesson.name }}</p>
        <p class="text-sm text-gray-500 truncate">{{ lesson.teacherName }}</p>
        <p class="text-sm text-gray-500 truncate">{{ lesson.location }}</p>
      </div>
      <Button
        icon="pi pi-eye"
        text
        rounded
        title="Показать урок"
        @click="onUnhide(lesson)"
      />
    </div>
    <div class="flex justify-end mt-4">
      <Button label="Закрыть" severity="secondary" @click="isVisible = false" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import type { Lesson } from "~/types/timetable";
import { getLessonKey } from "~/utils/saved-lessons";
import { useHiddenLessons } from "~/composables/saved-lessons";

defineProps<{
  lessons: Lesson[];
}>();

const isVisible = defineModel<boolean>("isVisible");

const { remove } = useHiddenLessons();

const onUnhide = (lesson: Lesson): void => {
  remove(getLessonKey(lesson));
};
</script>

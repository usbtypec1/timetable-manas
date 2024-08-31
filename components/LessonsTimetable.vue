<template>
  <h3 class="text-3xl font-semibold my-4">Расписание</h3>
  <DataTable
    :value="periodTimetables"
    show-gridlines
  >
    <Column field="period" header="Время"/>
    <Column
      v-for="{ field, header } in columns"
      :key="field"
      :field="field"
      :header="header"
    >
      <template #body="{ data }">
        <div
          v-if="(data[field] ?? []).length >= 1"
        >
          <div
            v-for="lesson in data[field]"
            class="shadow-md my-2 rounded px-3 py-2"
            :class="getBackgroundColorByLessonType(lesson.type)"
          >
            <p>{{ courseIdToDepartmentName[lesson.courseId] }}</p>
            <p>{{ lesson.name }}</p>
            <p>{{ lesson.teacherName }}</p>
            <p>{{ lesson.location }}</p>
          </div>
        </div>
        <div v-else>
          нет данных
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import type { PeriodTimetable } from '~/types/timetable'

const props = defineProps<{
  periodTimetables: PeriodTimetable[],
  courseIdToDepartmentName: Record<string, string>,
}>()

const columns = [
  {
    field: 'monday',
    header: 'Понедельник',
  },
  {
    field: 'tuesday',
    header: 'Вторник',
  },
  {
    field: 'wednesday',
    header: 'Среда',
  },
  {
    field: 'thursday',
    header: 'Четверг',
  },
  {
    field: 'friday',
    header: 'Пятница',
  },
]

const typeToBackground = {
  1: 'bg-amber-200 dark:bg-amber-500',
  2: 'bg-emerald-200 dark:bg-emerald-500',
  3: 'bg-blue-200 dark:bg-cyan-500',
  4: 'bg-gray-200 dark:bg-gray-500',
}

const getBackgroundColorByLessonType = (type: number): string => {
  return typeToBackground[type] || 'bg-gray-100 dark:bg-gray-500'
}
</script>

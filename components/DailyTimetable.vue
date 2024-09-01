<template>
  <h3 class="text-3xl font-semibold my-4">Расписание</h3>
  <Inplace class="my-3">
    <template #display>
      <Button text icon="pi pi-info-circle" label="Обозначения цветов карточек"/>
    </template>
    <template #content>
      <div class="my-2">
        <p class="font-semibold text-lg">Обозначения цветов карточек</p>
        <p>Зеленый - обязательные уроки в рамках направления</p>
        <p>Синий - обязательные общие уроки</p>
        <p>Желтый - выборочные уроки в рамках направления</p>
        <p>Серый - выборочные уроки вне рамок направления</p>
      </div>
    </template>
  </Inplace>

  <div class="my-4">
    <p class="text-md mb-1 font-semibold">Размер таблицы</p>
    <SelectButton
      v-model="textSize"
      :options="textSizeOptions"
      option-label="label"
      option-value="value"
    />
  </div>

  <div class="my-4">
    <p class="text-md mb-1 font-semibold">День недели</p>
    <MultiSelect
      v-model="weekday"
      :options="weekdays"
      option-label="label"
      fluid
      placeholder="Выберите день недели"
      :max-selected-labels="weekdays.length"
    />
  </div>

  <div
    v-for="day in weekday"
    :key="day.value"
  >
    <h3 class="text-3xl mb-2 font-semibold">{{ day.label }}</h3>
    <DataTable
      :value="periodTimetables"
      show-gridlines
      class="mb-8"
    >
      <Column field="period" header="Время" class="w-1/12"/>
      <Column
        :field="day.value"
        header="Уроки"
      >
        <template #body="{ data }">
          <div
            v-if="(data[day.value] ?? []).length >= 1"
          >
            <div
              v-for="lesson in data[day.value]"
              class="shadow-md my-2 rounded px-3 py-2"
              :class="[getBackgroundColorByLessonType(lesson.type), textSize]"
            >
              <p class="font-semibold mb-1">{{ courseIdToDepartmentName[lesson.courseId] }}</p>
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
  </div>
</template>

<script setup lang="ts">
import type { PeriodTimetable } from '~/types/timetable'

const props = defineProps<{
  periodTimetables: PeriodTimetable[],
  courseIdToDepartmentName: Record<string, string>,
}>()

interface Weekday {
  label: string
  value: string
}

const weekdays: Weekday[] = [
  {
    value: 'monday',
    label: 'Понедельник',
  },
  {
    value: 'tuesday',
    label: 'Вторник',
  },
  {
    value: 'wednesday',
    label: 'Среда',
  },
  {
    value: 'thursday',
    label: 'Четверг',
  },
  {
    value: 'friday',
    label: 'Пятница',
  },
]

const weekday = ref<Weekday>()

interface TextSize {
  label: string
  value: string
}

const textSizeOptions: TextSize[] = [
  {
    label: 'Маленький',
    value: 'text-xs',
  },
  {
    label: 'Средний',
    value: 'text-sm',
  },
  {
    label: 'Большой',
    value: 'text-lg',
  },
]

const textSize = ref<TextSize>(textSizeOptions[1].value)


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

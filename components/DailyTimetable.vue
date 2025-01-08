<template>
  <h3 class="text-3xl font-semibold my-4">Расписание</h3>
  <h4
    v-if="departmentName !== undefined"
    class="text-xl font-semibold mb-4"
  >
    {{ departmentName }}
  </h4>

  <DesktopViewToggleSwitch v-model="forceDesktopView"/>

  <BuildingCodeInplace/>
  <CardColorInplace/>

  <TextSizeSelect class="my-4"/>

  <MultiSelect 
    v-model="selectedWeekdayValues"
    :options="weekdayOptions"
    option-label="label"
    option-value="value"
    fluid
  />

  <div
    v-for="day in weekdayOptions.filter(({ value }) => selectedWeekdayValues.includes(value))"
    :key="day.value"
  >
    <h3 class="text-xl my-4 font-semibold">{{ day.label }}</h3>
    <DataTable
      :value="periodTimetables"
      show-gridlines
      class="mb-8"
      :class="settings.textSize"
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
              :class="[getBackgroundColorByLessonType(lesson.type), settings.textSize]"
            >
              <p
                v-if="showDepartmentNames"
                class="font-semibold mb-1"
              >
                {{ courseIdToDepartmentName[lesson.courseId] }}
              </p>
              <p>{{ lesson.name }}</p>
              <p v-if="settings.isTeacherNamesVisible">{{ lesson.teacherName }}</p>
              <p v-if="settings.isLocationsVisible">{{ lesson.location }}</p>
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
import { getWeekdayNumber } from '~/services/time'
import CardColorInplace from '~/components/inplaces/CardColorInplace.vue'
import BuildingCodeInplace from '~/components/inplaces/BuildingCodeInplace.vue'
import TextSizeSelect from '~/components/TextSizeSelect.vue'
import MultiSelect from 'primevue/multiselect'

defineProps<{
  periodTimetables: PeriodTimetable[],
  courseIdToDepartmentName: Record<string, string>,
  departmentName?: string,
  courseNumber?: number,
  showDepartmentNames: boolean,
}>()

const { settings } = useSettings()

const forceDesktopView = defineModel<boolean>('forceDesktopView')

interface Weekday {
  label: string
  value: string
}

const weekdayOptions: Weekday[] = [
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

const selectedWeekdayValues = ref<string[]>([weekdayOptions[getWeekdayNumber()].value])

interface TextSize {
  label: string
  value: string
}


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

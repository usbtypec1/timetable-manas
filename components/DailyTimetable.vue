<template>
  <h3 class="text-3xl font-semibold my-4">
    Расписание
  </h3>
  <h4
    v-if="departmentName !== undefined"
    class="text-xl font-semibold mb-4"
  >
    {{ departmentName }}
  </h4>

  <DesktopViewToggleSwitch v-model="forceDesktopView" />

  <BuildingCodeInplace />
  <CardColorInplace />

  <TextSizeSelect class="my-4" />

  <WeekdaysSelect v-model="weekdays" />

  <Button
    v-if="hiddenLessonsInView.length > 0"
    class="w-full mb-4"
    severity="secondary"
    outlined
    icon="pi pi-eye-slash"
    :label="`Скрыто уроков: ${hiddenLessonsInView.length} — нажмите, чтобы посмотреть`"
    @click="isHiddenDialogVisible = true"
  />
  <HiddenLessonsDialog
    v-model:is-visible="isHiddenDialogVisible"
    :lessons="hiddenLessonsInView"
  />

  <div
    v-for="day in weekdays"
    :key="day.value"
  >
    <h3 class="text-xl my-4 font-semibold">
      {{ day.label }}
    </h3>
    <DataTable
      :value="periodTimetables"
      show-gridlines
      class="mb-8"
      :class="settings.textSize"
    >
      <Column
        field="period"
        header="Время"
        class="w-1/12"
      />
      <Column
        :field="day.value"
        header="Уроки"
      >
        <template #body="{ data }">
          <LessonCell
            :lessons="data[day.value]"
            :course-id-to-department-name="courseIdToDepartmentName"
            :show-department-names="showDepartmentNames"
            :color-class-for="colorClassFor"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import type { Lesson, PeriodTimetable } from '~/types/timetable'
import type { Weekday } from '~/types/weekdays'

const props = defineProps<{
  periodTimetables: PeriodTimetable[]
  courseIdToDepartmentName: Record<string, string>
  departmentName?: string
  showDepartmentNames: boolean
  colorsByCourse: boolean
}>()

const getBackgroundColorByCourseId = createColorDispenser()

const colorClassFor = (lesson: Lesson): string =>
  props.colorsByCourse
    ? getBackgroundColorByCourseId(lesson.courseId)
    : getBackgroundColorByLessonType(lesson.type)

const { settings } = useSettings()

const forceDesktopView = defineModel<boolean>('forceDesktopView')

const weekdays = ref<Weekday[]>([weekdayOptions[getWeekdayNumber()]])

const { has: isHidden } = useHiddenLessons()

const isHiddenDialogVisible = ref<boolean>(false)

const weekdayFields = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const

const hiddenLessonsInView = computed((): Lesson[] => {
  const seen = new Map<string, Lesson>()
  for (const periodTimetable of props.periodTimetables) {
    for (const field of weekdayFields) {
      for (const lesson of periodTimetable[field] ?? []) {
        const key = getLessonKey(lesson)
        if (isHidden(lesson) && !seen.has(key)) {
          seen.set(key, lesson)
        }
      }
    }
  }
  return [...seen.values()]
})
</script>

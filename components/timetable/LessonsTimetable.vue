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

  <DesktopViewToggleSwitch
    v-if="width <= MOBILE_LAYOUT_MAX_WIDTH_PX"
    v-model="forceDesktopView"
  />

  <BuildingCodeInplace />
  <CardColorInplace />

  <TextSizeSelect class="my-4" />

  <Button
    class="w-full mb-4"
    severity="secondary"
    outlined
    icon="pi pi-calendar-plus"
    label="Экспорт в календарь (.ics)"
    @click="isExportDialogVisible = true"
  />
  <ExportToIcsDialog
    v-model:is-visible="isExportDialogVisible"
    :period-timetables="periodTimetables"
    :course-id-to-department-name="courseIdToDepartmentName"
    :show-department-names="showDepartmentNames"
  />

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

  <DataTable
    :value="periodTimetables"
    show-gridlines
    :class="settings.textSize"
  >
    <Column
      field="period"
      header="Время"
      class="w-1/12"
    />
    <Column
      v-for="{ field, header } in columns"
      :key="field"
      :field="field"
      :header="header"
    >
      <template #body="{ data }">
        <LessonCell
          :lessons="data[field]"
          :course-id-to-department-name="courseIdToDepartmentName"
          :show-department-names="showDepartmentNames"
          :color-class-for="colorClassFor"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import type { Lesson, PeriodTimetable } from '~/types/timetable'
import { MOBILE_LAYOUT_MAX_WIDTH_PX } from '~/composables/timetable-layout'

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

const { width } = useWindowSize()

const forceDesktopView = defineModel<boolean>('forceDesktopView')

const { has: isHidden } = useHiddenLessons()

const isExportDialogVisible = ref<boolean>(false)

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

const columns = [
  { field: 'monday', header: 'Понедельник' },
  { field: 'tuesday', header: 'Вторник' },
  { field: 'wednesday', header: 'Среда' },
  { field: 'thursday', header: 'Четверг' },
  { field: 'friday', header: 'Пятница' },
]
</script>

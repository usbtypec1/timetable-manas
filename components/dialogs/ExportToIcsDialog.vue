<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    header="Экспорт в календарь"
    class="w-full sm:max-w-lg mx-6"
  >
    <p class="font-semibold mb-2">
      Что экспортировать?
    </p>
    <div
      v-for="option in exportScopeOptions"
      :key="option.value"
      class="mb-3"
    >
      <label class="flex items-start gap-2 cursor-pointer">
        <RadioButton
          v-model="exportScope"
          :value="option.value"
          class="mt-1"
        />
        <span>
          <span class="font-semibold block">{{ option.label }}</span>
          <span class="text-sm text-gray-500 block">{{ option.hint }}</span>
        </span>
      </label>
    </div>

    <Message
      v-if="exportableLessonsCount === 0"
      severity="warn"
      :closable="false"
      class="mb-3"
    >
      С выбранным вариантом нет уроков для экспорта
    </Message>

    <Button
      class="w-full mb-4"
      icon="pi pi-download"
      :label="`Скачать файл .ics (${exportableLessonsCount})`"
      :disabled="exportableLessonsCount === 0"
      @click="onExport"
    />

    <hr class="my-4 border-gray-200 dark:border-gray-700">

    <p class="font-semibold mb-2">
      Как добавить расписание в Google Calendar
    </p>
    <ol class="list-decimal list-inside text-sm text-gray-500 flex flex-col gap-y-1">
      <li>Скачайте файл кнопкой выше — он сохранится в папку «Загрузки» на вашем устройстве.</li>
      <li>На компьютере откройте calendar.google.com и войдите в свой аккаунт Google (импорт файлов работает только в веб-версии, не в приложении).</li>
      <li>Нажмите на значок шестерёнки в правом верхнем углу и выберите «Настройки».</li>
      <li>В меню слева выберите «Импорт и экспорт».</li>
      <li>Нажмите «Выбрать файл», укажите скачанный .ics, выберите календарь для импорта (рекомендуем отдельный, а не основной) и нажмите «Импорт».</li>
      <li>Уроки появятся в выбранном календаре и будут повторяться каждую неделю. Если на телефоне используется тот же аккаунт Google, они синхронизируются автоматически.</li>
    </ol>

    <div class="flex justify-end mt-4">
      <Button
        label="Закрыть"
        severity="secondary"
        @click="isVisible = false"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import type { Lesson, PeriodTimetable } from '~/types/timetable'

const props = defineProps<{
  periodTimetables: PeriodTimetable[]
  courseIdToDepartmentName: Record<string, string>
  showDepartmentNames: boolean
}>()

const isVisible = defineModel<boolean>('isVisible')

const { has: isFavorite } = useFavoriteLessons()
const { has: isHidden } = useHiddenLessons()
const { download } = useIcsDownload()

type ExportScope = 'favorites' | 'visible' | 'all'

const exportScope = ref<ExportScope>('visible')

const exportScopeOptions: { value: ExportScope, label: string, hint: string }[] = [
  {
    value: 'favorites',
    label: 'Только избранные уроки',
    hint: 'В календарь попадут только уроки, отмеченные как избранные.',
  },
  {
    value: 'visible',
    label: 'Без скрытых уроков',
    hint: 'В календарь попадут все уроки, кроме тех, что вы скрыли.',
  },
  {
    value: 'all',
    label: 'Все уроки',
    hint: 'В календарь попадут все уроки расписания, включая скрытые.',
  },
]

const shouldIncludeLesson = (lesson: Lesson): boolean => {
  if (exportScope.value === 'favorites') {
    return isFavorite(lesson)
  }
  if (exportScope.value === 'visible') {
    return !isHidden(lesson)
  }
  return true
}

const exportableLessonsCount = computed((): number =>
  countLessons(props.periodTimetables, shouldIncludeLesson))

const onExport = (): void => {
  const icsContent = buildTimetableIcs({
    periodTimetables: props.periodTimetables,
    shouldIncludeLesson,
    courseIdToDepartmentName: props.courseIdToDepartmentName,
    showDepartmentNames: props.showDepartmentNames,
  })
  download(icsContent, 'raspisanie.ics')
}
</script>

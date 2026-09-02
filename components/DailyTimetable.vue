<template>
  <h3 class="text-3xl font-semibold my-4">Расписание</h3>
  <h4 v-if="departmentName !== undefined" class="text-xl font-semibold mb-4">
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

  <div v-for="day in weekdays" :key="day.value">
    <h3 class="text-xl my-4 font-semibold">{{ day.label }}</h3>
    <DataTable
      :value="periodTimetables"
      show-gridlines
      class="mb-8"
      :class="settings.textSize"
    >
      <Column field="period" header="Время" class="w-1/12" />
      <Column :field="day.value" header="Уроки">
        <template #body="{ data }">
          <div v-if="visibleLessons(data[day.value]).length >= 1">
            <div
              v-for="(lesson, index) in visibleLessons(data[day.value])"
              class="shadow-md my-2 rounded px-3 py-2 flex justify-between items-start gap-2"
              :class="[
                colorsByCourse
                  ? getBackgroundColorByCourseId(lesson.courseId)
                  : getBackgroundColorByLessonType(lesson.type),
              ]"
            >
              <div class="min-w-0">
                <p v-if="showDepartmentNames" class="font-semibold mb-1">
                  {{ courseIdToDepartmentName[lesson.courseId] }}
                </p>
                <p>{{ lesson.name }}</p>
                <p v-if="settings.isTeacherNamesVisible">
                  {{ lesson.teacherName }}
                </p>
                <p v-if="settings.isLocationsVisible">{{ lesson.location }}</p>
              </div>
              <div class="flex gap-x-1 shrink-0">
                <Button
                  :icon="isFavorite(lesson) ? 'pi pi-heart-fill' : 'pi pi-heart'"
                  text
                  rounded
                  size="small"
                  :severity="isFavorite(lesson) ? 'danger' : 'secondary'"
                  title="Избранное"
                  @click="toggleFavorite(lesson)"
                />
                <Button
                  icon="pi pi-eye-slash"
                  text
                  rounded
                  size="small"
                  severity="secondary"
                  title="Скрыть урок"
                  @click="toggleHidden(lesson)"
                />
              </div>
            </div>
          </div>
          <div v-else>нет данных</div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import type { Lesson, PeriodTimetable } from "~/types/timetable";
import CardColorInplace from "~/components/inplaces/CardColorInplace.vue";
import BuildingCodeInplace from "~/components/inplaces/BuildingCodeInplace.vue";
import TextSizeSelect from "~/components/TextSizeSelect.vue";
import type { Weekday } from "~/types/weekdays";
import WeekdaysSelect from "./WeekdaysSelect.vue";
import HiddenLessonsDialog from "~/components/dialogs/HiddenLessonsDialog.vue";
import {
  getBackgroundColorByLessonType,
  createColorDispancer,
} from "~/utils/lesson-card";
import { getWeekdayNumber } from "~/utils/time";
import { getLessonKey } from "~/utils/saved-lessons";
import { useFavoriteLessons, useHiddenLessons } from "~/composables/saved-lessons";

const props = defineProps<{
  periodTimetables: PeriodTimetable[];
  courseIdToDepartmentName: Record<string, string>;
  departmentName?: string;
  courseNumber?: number;
  showDepartmentNames: boolean;
  colorsByCourse: boolean;
}>();

const getBackgroundColorByCourseId = createColorDispancer()

const { settings } = useSettings();

const forceDesktopView = defineModel<boolean>("forceDesktopView");

const weekdays = ref<Weekday[]>([weekdayOptions[getWeekdayNumber()]]);

const { has: isFavorite, toggle: toggleFavorite } = useFavoriteLessons();
const { has: isHidden, toggle: toggleHidden } = useHiddenLessons();

const isHiddenDialogVisible = ref<boolean>(false);

const visibleLessons = (lessons: Lesson[] | undefined): Lesson[] =>
  (lessons ?? []).filter((lesson) => !isHidden(lesson));

const weekdayFields = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

const hiddenLessonsInView = computed((): Lesson[] => {
  const seen = new Map<string, Lesson>();
  for (const periodTimetable of props.periodTimetables) {
    for (const field of weekdayFields) {
      for (const lesson of periodTimetable[field] ?? []) {
        const key = getLessonKey(lesson);
        if (isHidden(lesson) && !seen.has(key)) {
          seen.set(key, lesson);
        }
      }
    }
  }
  return [...seen.values()];
});
</script>

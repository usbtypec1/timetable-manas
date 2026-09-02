<template>
  <h3 class="text-3xl font-semibold my-4">Расписание</h3>
  <h4 v-if="departmentName !== undefined" class="text-xl font-semibold mb-4">
    {{ departmentName }}
  </h4>

  <DesktopViewToggleSwitch v-if="width <= 920" v-model="forceDesktopView" />

  <BuildingCodeInplace />
  <CardColorInplace />

  <TextSizeSelect class="my-4" />

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
    <Column field="period" header="Время" class="w-1/12" />
    <Column
      v-for="{ field, header } in columns"
      :key="field"
      :field="field"
      :header="header"
    >
      <template #body="{ data }">
        <div v-if="visibleLessons(data[field]).length >= 1">
          <div
            v-for="(lesson, index) in visibleLessons(data[field])"
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
</template>

<script setup lang="ts">
import type { Lesson, PeriodTimetable } from "~/types/timetable";
import { useWindowSize } from "@vueuse/core";
import BuildingCodeInplace from "~/components/inplaces/BuildingCodeInplace.vue";
import CardColorInplace from "~/components/inplaces/CardColorInplace.vue";
import TextSizeSelect from "~/components/TextSizeSelect.vue";
import HiddenLessonsDialog from "~/components/dialogs/HiddenLessonsDialog.vue";
import {
  getBackgroundColorByLessonType,
  createColorDispancer
} from "~/utils/lesson-card";
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

const { width } = useWindowSize();

const forceDesktopView = defineModel<boolean>("forceDesktopView");

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

const columns = [
  {
    field: "monday",
    header: "Понедельник",
  },
  {
    field: "tuesday",
    header: "Вторник",
  },
  {
    field: "wednesday",
    header: "Среда",
  },
  {
    field: "thursday",
    header: "Четверг",
  },
  {
    field: "friday",
    header: "Пятница",
  },
];
</script>

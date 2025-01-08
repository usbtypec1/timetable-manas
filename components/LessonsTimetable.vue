<template>
  <h3 class="text-3xl font-semibold my-4">Расписание</h3>
  <h4 v-if="departmentName !== undefined" class="text-xl font-semibold mb-4">
    {{ departmentName }}
  </h4>

  <DesktopViewToggleSwitch v-if="width <= 920" v-model="forceDesktopView" />

  <BuildingCodeInplace />
  <CardColorInplace />

  <TextSizeSelect class="my-4" />

  <DataTable :value="periodTimetables" show-gridlines :class="settings.textSize">
    <Column field="period" header="Время" class="w-1/12" />
    <Column
      v-for="{ field, header } in columns"
      :key="field"
      :field="field"
      :header="header"
    >
      <template #body="{ data }">
        <div v-if="(data[field] ?? []).length >= 1">
          <div
            v-for="lesson in data[field]"
            class="shadow-md my-2 rounded px-3 py-2"
            :class="[getBackgroundColorByLessonType(lesson.type)]"
            >
            <p v-if="showDepartmentNames" class="font-semibold mb-1">
              {{ courseIdToDepartmentName[lesson.courseId] }}
            </p>
            <p>{{ lesson.name }}</p>
            <p v-if="settings.isTeacherNamesVisible">
              {{ lesson.teacherName }}
            </p>
            <p v-if="settings.isLocationsVisible">{{ lesson.location }}</p>
          </div>
        </div>
        <div v-else>нет данных</div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import type { PeriodTimetable } from "~/types/timetable";
import { useWindowSize } from "@vueuse/core";
import BuildingCodeInplace from "~/components/inplaces/BuildingCodeInplace.vue";
import CardColorInplace from "~/components/inplaces/CardColorInplace.vue";
import TextSizeSelect from "~/components/TextSizeSelect.vue";

defineProps<{
  periodTimetables: PeriodTimetable[];
  courseIdToDepartmentName: Record<string, string>;
  departmentName?: string;
  courseNumber?: number;
  showDepartmentNames: boolean;
}>();

const { settings } = useSettings();

const { width } = useWindowSize();

const forceDesktopView = defineModel<boolean>("forceDesktopView");

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

const typeToBackground: Record<number, string> = {
  1: "bg-amber-200 dark:bg-amber-500",
  2: "bg-emerald-200 dark:bg-emerald-500",
  3: "bg-blue-200 dark:bg-cyan-500",
  4: "bg-gray-200 dark:bg-gray-500",
};

const getBackgroundColorByLessonType = (type: number): string => {
  return typeToBackground[type] || "bg-gray-100 dark:bg-gray-500";
};
</script>

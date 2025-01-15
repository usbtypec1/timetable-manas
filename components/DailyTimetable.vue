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
          <div v-if="(data[day.value] ?? []).length >= 1">
            <div
              v-for="(lesson, index) in data[day.value]"
              class="shadow-md my-2 rounded px-3 py-2"
              :class="[
                colorsByCourse
                  ? comparatorBackgroundColors[
                      index % comparatorBackgroundColors.length
                    ]
                  : getBackgroundColorByLessonType(lesson.type),
              ]"
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
  </div>
</template>

<script setup lang="ts">
import type { PeriodTimetable } from "~/types/timetable";
import CardColorInplace from "~/components/inplaces/CardColorInplace.vue";
import BuildingCodeInplace from "~/components/inplaces/BuildingCodeInplace.vue";
import TextSizeSelect from "~/components/TextSizeSelect.vue";
import type { Weekday } from "~/types/weekdays";
import WeekdaysSelect from "./WeekdaysSelect.vue";
import {
  getBackgroundColorByLessonType,
  comparatorBackgroundColors,
} from "~/utils/lesson-card";
import { getWeekdayNumber } from "~/utils/time";

defineProps<{
  periodTimetables: PeriodTimetable[];
  courseIdToDepartmentName: Record<string, string>;
  departmentName?: string;
  courseNumber?: number;
  showDepartmentNames: boolean;
  colorsByCourse: boolean;
}>();

const { settings } = useSettings();

const forceDesktopView = defineModel<boolean>("forceDesktopView");

const weekdays = ref<Weekday[]>([weekdayOptions[getWeekdayNumber()]]);
</script>

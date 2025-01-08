<template>
  <MultiSelect
    v-model="selectedWeekdayValues"
    :options="weekdayOptions"
    option-label="label"
    option-value="value"
    fluid
  />
</template>

<script setup lang="ts">
import type { Weekday } from "~/types/weekdays";

const weekdays = defineModel<Weekday[]>({ required: true });

const weekdayOptions: Weekday[] = [
  {
    value: "monday",
    label: "Понедельник",
  },
  {
    value: "tuesday",
    label: "Вторник",
  },
  {
    value: "wednesday",
    label: "Среда",
  },
  {
    value: "thursday",
    label: "Четверг",
  },
  {
    value: "friday",
    label: "Пятница",
  },
];

const selectedWeekdayValues = ref<string[]>([
  weekdayOptions[getWeekdayNumber()].value,
]);

watch(selectedWeekdayValues, (): void => {
  weekdays.value = weekdayOptions.filter((weekday) =>
    selectedWeekdayValues.value.includes(weekday.value)
  );
});
</script>

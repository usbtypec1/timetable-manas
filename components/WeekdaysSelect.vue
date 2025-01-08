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
import { weekdayOptions } from "~/utils/weekdays";

const weekdays = defineModel<Weekday[]>({ required: true });

const selectedWeekdayValues = ref<string[]>([
  weekdayOptions[getWeekdayNumber()].value,
]);

watch(selectedWeekdayValues, (): void => {
  weekdays.value = weekdayOptions.filter((weekday) =>
    selectedWeekdayValues.value.includes(weekday.value)
  );
});
</script>

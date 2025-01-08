<template>
  <div>
    <p class="text-md mb-1 font-semibold">Размер таблицы</p>
    <SelectButton
      v-model="textSize"
      @update:modelValue="onTextSizeChange"
      :options="textSizeOptions"
      option-label="label"
      option-value="value"
    />
  </div>
</template>

<script setup lang="ts">
import type { TextSize } from "~/types/text-sizes";

const { settings, update: updateSettings } = useSettings();

const textSizeOptions: TextSize[] = [
  {
    label: "Маленький",
    value: "text-xs",
  },
  {
    label: "Средний",
    value: "text-sm",
  },
  {
    label: "Большой",
    value: "text-lg",
  },
];

const onTextSizeChange = (textSize: string): void => {
  updateSettings({ textSize });
};

const textSize = ref<string>(settings.value.textSize);
</script>

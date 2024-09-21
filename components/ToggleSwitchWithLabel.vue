<template>
  <div class="flex items-center gap-x-2 mb-4">
    <ToggleSwitch
      v-model="value"
      :input-id="inputId"
    />
    <label
      class="font-semibold"
      :for="inputId"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
const inputId = useId()
const value = defineModel<boolean>()

defineProps<{
  label: string,
}>()
</script>

<template>
  <div>
    <Listbox
      v-model="selectedDepartments"
      :options="faculties"
      multiple
      optionLabel="name"
      class="w-full md:w-96"
      optionGroupLabel="name"
      optionGroupChildren="departments"
      filter
      checkmark
      filter-placeholder="Поиск по направлению"
    />
    <Button
      v-if="selectedDepartments.length > 0"
      label="Очистить"
      outlined
      icon="pi pi-times"
      severity="danger"
      class="w-full mt-2"
      @click="emit('clear')"
    />
  </div>
</template>

<script setup lang="ts">
import type { Department } from '~/types/departments'
import type { Faculty } from '~/types/faculties'

defineProps<{ faculties: Faculty[] }>()

const emit = defineEmits(['clear'])

const selectedDepartments = defineModel<Department[]>('selectedDepartments')
</script>

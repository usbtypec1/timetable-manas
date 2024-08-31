<template>
  <div class="mx-4 my-5">
    <div class="flex flex-col md:flex-row gap-x-4">
      <Listbox
        v-model="selectedDepartments"
        :options="faculties"
        multiple
        optionLabel="name"
        class="w-full md:w-96"
        optionGroupLabel="name"
        optionGroupChildren="departments"
        filter
        :virtualScrollerOptions="{ itemSize: 36 }"
        checkmark
        filter-placeholder="Поиск по направлению"
      />
      <div class="grow grid grid-cols-3 gap-x-3 gap-y-2">
        <Panel :header="department.name" v-for="department in selectedDepartments">
          <div v-for="index in 4" class="flex gap-x-2">
            <label :for="`${department.id}-${index}`">Курс: {{ index }}</label>
            <Checkbox
              :input-id="`${department.id}-${index}`"
              :value="{ id: department.id, index }" v-model="result"/>
          </div>

        </Panel>
      </div>
    </div>
    <LessonsTimetable/>
  </div>
</template>

<script setup lang="ts">
import faculties from '~/assets/faculties.json'

const result = ref([])
const selectedDepartments = ref<string[]>([])
</script>

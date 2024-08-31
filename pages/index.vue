<template>
  <div class="mx-4 my-5">
    <div class="flex flex-col md:flex-row gap-x-4 gap-y-2">
      <Listbox
        v-model="selectedDepartments"
        :options="faculties"
        @change="onChange"
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
          <div v-for="course in department.courses" class="flex gap-x-2">
            <label :for="course.id">Курс: {{ course.number }}</label>
            <Checkbox
              :input-id="String(course.id)"
              :value="course.id"
              v-model="result"
            />
          </div>

        </Panel>
      </div>
    </div>
    <LessonsTimetableSkeleton
      v-if="status === 'pending'"
    />
    <LessonsTimetable
      v-else-if="status === 'success'"
      :period-timetables="data"
      :course-id-to-department-name="courseIdToDepartmentName"
    />
  </div>
</template>

<script setup lang="ts">
import faculties from '~/assets/faculties.json'

const selectedDepartments = ref([])
const result = ref([])

const { data, refresh, status } = await useFetch('/api/timetable', { query: { courseId: result }, watch: false, immediate: false })


watch([result], async () => {
  if (result.value.length > 0) {
    await refresh()
  }
})

const courseIdToDepartmentName = computed(() => {
  const result: Record<string, [string, string]> = {}
  for (const faculty of faculties) {
    for (const department of faculty.departments) {
      for (const course of department.courses) {
        result[course.id] = `${course.number}-курс ${department.name}`
      }
    }
  }
  return result
})
</script>

<template>
  <Stepper value="1">
    <StepItem value="1">
      <Step value="1">Факультет</Step>
      <StepPanel v-slot="{ activateCallback }" value="1">
        <div class="px-4 py-3 flex flex-col gap-y-4">
          <p class="text-lg font-semibold">Выберите факультет</p>
          <Listbox
            v-model="selectedFacultyId"
            :options="faculties"
            option-label="name"
            option-value="id"
            empty-message="Нет доступных факультетов"
          />
          <Button
            label="Дальше"
            icon="pi pi-arrow-right"
            iconPos="right"
            :severity="selectedFacultyId ? 'primary' : 'secondary'"
            :disabled="!selectedFacultyId"
            @click="activateCallback('2')"
          />
        </div>
      </StepPanel>
    </StepItem>
    <StepItem value="2">
      <Step value="2">Направление</Step>
      <StepPanel v-slot="{ activateCallback }" value="2">
        <div class="px-4 py-3 flex flex-col gap-y-4">
          <p class="text-lg font-semibold">Выберите направление</p>
          <Listbox
            v-model="selectedDepartmentId"
            :options="departments"
            option-label="name"
            option-value="id"
            empty-message="Не выбран факультет"
          />
          <div class="w-full flex justify-between gap-x-3">
            <Button
              label="Назад"
              icon="pi pi-arrow-left"
              icon-pos="left"
              :outlined="selectedFacultyId !== undefined"
              class="grow"
              severity="warn"
              @click="activateCallback('1')"
            />
            <Button
              label="Дальше"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="grow"
              :severity="selectedDepartmentId ? 'primary' : 'secondary'"
              :disabled="!selectedDepartmentId"
              @click="activateCallback('3')"
            />
          </div>
        </div>
      </StepPanel>
    </StepItem>
    <StepItem value="3">
      <Step value="3">Курс</Step>
      <StepPanel v-slot="{ activateCallback }" value="3">
        <div class="px-4 py-3 flex flex-col gap-y-4">
          <p class="text-lg font-semibold">Выберите курс</p>
          <Listbox
            v-model="selectedCourse"
            :options="courses"
            :option-label="formatCourseLabel"
            empty-message="Не выбрано направление"
          />
          <div class="w-full flex justify-between gap-x-3">
            <Button
              label="Назад"
              icon="pi pi-arrow-left"
              icon-pos="left"
              class="grow"
              severity="warn"
              :outlined="selectedDepartmentId !== undefined"
              @click="activateCallback('2')"
            />
            <Button
              label="Дальше"
              class="grow"
              icon="pi pi-arrow-right"
              icon-pos="right"
              :severity="selectedCourse ? 'primary' : 'secondary'"
              :disabled="selectedCourse === undefined"
              :loading="isLoading"
              @click="emit('submit', selectedCourse, departmentName)"
            />
          </div>
        </div>
      </StepPanel>
    </StepItem>
  </Stepper>

</template>

<script setup lang="ts">
import type { Course } from '~/types/courses'
import type { Department } from '~/types/departments'
import type { Faculty } from '~/types/faculties'

const selectedCourse = ref<Course>()
const selectedDepartmentId = ref<string>()
const selectedFacultyId = ref<string>()

const props = defineProps<{
  faculties: Faculty[],
  isLoading: boolean,
}>()

const emit = defineEmits<{
  submit: [course: Course, departmentName: string],
}>()

watch(selectedFacultyId, (): void => {
  selectedDepartmentId.value = undefined
  selectedCourse.value = undefined
})

watch(selectedDepartmentId, (): void => {
  selectedCourse.value = undefined
})

const departments = computed((): Department[] => {
  return props.faculties.find(faculty => faculty.id === selectedFacultyId.value)?.departments || []
})

const courses = computed((): Course[] => {
  return departments.value.find(department => department.id === selectedDepartmentId.value)?.courses || []
})

const departmentName = computed((): string | undefined => {
  return departments.value.find(department => department.id === selectedDepartmentId.value)?.name
})

const formatCourseLabel = (course: Course): string => `Курс ${course.number}`
</script>

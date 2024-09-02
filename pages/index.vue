<template>
  <div>
    <Title>Манас | Расписание</Title>

    <NuxtLink :to="{ name: 'multiple' }">
      <Button class="mb-2" label="Сравнить расписания" outlined/>
    </NuxtLink>
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
              v-model="selectedCourseId"
              :options="courses"
              :option-label="formatCourseLabel"
              option-value="id"
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
                :severity="selectedCourseId ? 'primary' : 'secondary'"
                :disabled="!selectedCourseId"
                :loading="isLoading"
                @click="onSubmit"
              />
            </div>
          </div>
        </StepPanel>
      </StepItem>
    </Stepper>
  </div>
</template>

<script setup lang="ts">
import { getFaculties } from '~/services/faculties'
import type { Department } from '~/types/departments'
import type { Course } from '~/types/courses'

const selectedFacultyId = ref<string>()
const selectedDepartmentId = ref<string>()
const selectedCourseId = ref<number>()

const isLoading = ref<boolean>(false)

watch(selectedFacultyId, () => {
  selectedDepartmentId.value = undefined
  selectedCourseId.value = undefined
})

watch(selectedDepartmentId, () => {
  selectedCourseId.value = undefined
})

const onSubmit = async () => {
  isLoading.value = true
  await navigateTo({ name: 'courses-id', params: { id: selectedCourseId.value } })
}

const formatCourseLabel = (course: Course): string => `Курс ${course.number}`

const faculties = getFaculties()

const departments = computed((): Department[] => {
  return faculties.find(faculty => faculty.id === selectedFacultyId.value)?.departments || []
})

const courses = computed((): Course[] => {
  return departments.value.find(department => department.id === selectedDepartmentId.value)?.courses || []
})
</script>

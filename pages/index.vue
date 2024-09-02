<template>
  <div>
    <NuxtLink :to="{ name: 'multiple' }">
      <Button class="mb-2" label="Сравнить расписания" outlined/>
    </NuxtLink>
    <div v-if="isCoursePickerShown">
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
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  class="grow"
                  :severity="selectedCourseId ? 'primary' : 'secondary'"
                  :disabled="!selectedCourseId"
                  @click="onSubmit"
                />
              </div>
            </div>
          </StepPanel>
        </StepItem>
      </Stepper>
    </div>

    <div
      v-if="status === 'pending'"
      class="flex h-screen justify-center items-center"
    >
      <ProgressSpinner/>
    </div>

    <template
      v-if="!isCoursePickerShown"
    >
      <template v-if="width <= 920 && !forceDesktopView">
        <DailyTimetable
          v-if="status === 'success'"
          :period-timetables="data"
          :course-id-to-department-name="courseIdToDepartmentName(faculties)"
          v-model:force-desktop-view="forceDesktopView"
        />
      </template>
      <template v-else>
        <LessonsTimetable
          v-if="status === 'success'"
          :period-timetables="data"
          :course-id-to-department-name="courseIdToDepartmentName(faculties)"
          v-model:force-desktop-view="forceDesktopView"
        />
      </template>

      <FloatingCornerButton
        severity="primary"
        @click="isCoursePickerShown = true"
      />
    </template>

  </div>
</template>

<script setup lang="ts">
import { getFaculties } from '~/server/faculties'
import { useStorage, useWindowSize } from '@vueuse/core'
import type { Department } from '~/types/departments'
import type { Course } from '~/types/courses'
import type { PeriodTimetable } from '~/types/timetable'
import { courseIdToDepartmentName } from '~/services/departments'

const { width } = useWindowSize()

const forceDesktopView = ref<boolean>(false)

const isCoursePickerShown = ref<boolean>(true)

const selectedFacultyId = ref<string>()
const selectedDepartmentId = ref<string>()
const selectedCourseId = ref<number>()

watch(selectedFacultyId, () => {
  selectedDepartmentId.value = undefined
  selectedCourseId.value = undefined
})

watch(selectedDepartmentId, () => {
  selectedCourseId.value = undefined
})

const { data, status, execute } = useFetch<PeriodTimetable[]>('/api/timetable', {
  query: { courseId: selectedCourseId },
  immediate: false,
  watch: false,
})

const onSubmit = async () => {
  isCoursePickerShown.value = false
  await execute()
}

const formatCourseLabel = (course: Course): string => `Курс ${course.number}`

const selectedCourseIds = useStorage<number[]>('selectedCourseIds', [])

const faculties = getFaculties()

const departments = computed((): Department[] => {
  return faculties.find(faculty => faculty.id === selectedFacultyId.value)?.departments || []
})

const courses = computed((): Course[] => {
  return departments.value.find(department => department.id === selectedDepartmentId.value)?.courses || []
})
</script>

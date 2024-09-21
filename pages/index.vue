<template>
  <div>
    <Title>Манас | Расписание</Title>

    <div class="flex justify-between mb-2">
      <NuxtLink :to="{ name: 'multiple' }">
        <Button text label="Сравнить расписания" outlined/>
      </NuxtLink>
      <Button
        icon="pi pi-cog"
        @click="isSettingsDialogVisible = true"
        text
        label="Настройки"
      />
    </div>

    <CourseChooseStepper
      :faculties="faculties"
      :is-loading="isLoading"
      @submit="onSubmit"
    />

    <section
      v-if="!isLoading && lastViewedCourses.length && settings.isLastViewedCoursesVisible"
      class="flex flex-col gap-y-3 my-3"
    >
      <h3 class="font-semibold text-xl text-center">Быстрый просмотр</h3>
      <NuxtLink
        v-for="{ departmentName, courseNumber, courseId } in lastViewedCourses.toReversed()"
        :key="courseNumber"
        :to="{ name: 'courses-id', params: { id: courseId } }"
      >
        <Button
          class=" w-full"
          severity="help"
          outlined
          :label="`${departmentName} - ${courseNumber} курс`"
        />
      </NuxtLink>
    </section>

    <SettingsDialog v-model:is-visible="isSettingsDialogVisible"/>
  </div>
</template>

<script setup lang="ts">
import { getDepartmentNameAndCourseNumberByCourseId, getFaculties } from '~/services/faculties'
import { useStorage } from '@vueuse/core'
import SettingsDialog from '~/components/dialogs/SettingsDialog.vue'

const { settings } = useSettings()

const isLoading = ref<boolean>(false)
const isSettingsDialogVisible = ref<boolean>(false)

const lastViewedCourseIds = useStorage('lastCourseIds', [])

const onSubmit = async (courseId: number): void => {
  isLoading.value = true
  if (lastViewedCourseIds.value.includes(courseId)) {
    lastViewedCourseIds.value = lastViewedCourseIds.value.filter((id) => id !== courseId)
  }
  lastViewedCourseIds.value.push(courseId)
  if (lastViewedCourseIds.value.length > 3) {
    lastViewedCourseIds.value.shift()
  }
  await navigateTo({ name: 'courses-id', params: { id: courseId } })
}

const lastViewedCourses = computed((): {
  departmentName: string,
  courseNumber: number
}[] => lastViewedCourseIds.value.map((courseId) => getDepartmentNameAndCourseNumberByCourseId(courseId)))

const faculties = getFaculties()
</script>
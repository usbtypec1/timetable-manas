<template>
  <div>
    <Title>Манас | Расписание</Title>

    <NuxtLink :to="{ name: 'multiple' }">
      <Button class="mb-2" label="Сравнить расписания" outlined/>
    </NuxtLink>

    <CourseChooseStepper
      :faculties="faculties"
      :is-loading="isLoading"
      @submit="onSubmit"
    />

    <NuxtLink
      v-if="lastViewedCourse.courseId !== undefined && !isLoading"
      :to="{ name: 'courses-id', params: { id: lastViewedCourse.courseId } }"
    >
      <Button
        class="my-4 w-full"
        severity="help"
        outlined
        :label="`Быстрый просмотр: ${lastViewedCourse.departmentName} - ${lastViewedCourse.courseNumber} курс`"
      />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { getFaculties } from '~/services/faculties'
import { useStorage } from '@vueuse/core'
import type { Course } from '~/types/courses'

const isLoading = ref<boolean>(false)

const lastViewedCourse = useStorage('lastCourse', {})

const onSubmit = async (course: Course, departmentName: string): void => {
  isLoading.value = true
  lastViewedCourse.value = {
    departmentName,
    courseId: course.id,
    courseNumber: course.number,
  }
  await navigateTo({ name: 'courses-id', params: { id: course.id } })
}

const faculties = getFaculties()
</script>
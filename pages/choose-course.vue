<template>
  <div>
    <Title>Манас | Выбор курса</Title>

    <h3 class="text-3xl font-semibold my-4">Выбор курса</h3>

    <CourseChooseStepper
      :faculties="faculties"
      :is-loading="isLoading"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { getFaculties } from '~/services/faculties'
import { useCoursesHistory } from '~/composables/courses-history'

const isLoading = ref<boolean>(false)

const { push: pushToCoursesHistory } = useCoursesHistory({ maxSize: 3 })

const onSubmit = async (courseId: number): Promise<void> => {
  isLoading.value = true
  pushToCoursesHistory(courseId)
  await navigateTo({ name: 'courses-id', params: { id: courseId } })
}

const faculties = getFaculties()
</script>

<template>
  <NuxtLink :to="{ name: 'courses-id', params: { id: courseId } }">
    <Button
      class=" w-full"
      severity="help"
      outlined
      :label="`${departmentName} - ${courseNumber} курс`"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  departmentName: string
  courseNumber: number
  courseId: number
}>()
</script>

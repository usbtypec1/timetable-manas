<template>
  <div>
    <NuxtLink :to="{ name: 'choose-course' }">
      <Button
        class="w-full mb-4"
        label="Выбрать курс"
        icon="pi pi-arrow-right"
        icon-pos="right"
      />
    </NuxtLink>

    <FavoriteLessonsSection />

    <RecentCoursesSection />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Манас | Расписание',
  description: 'Улучшенное расписание университета Манас: избранные уроки и быстрый доступ к недавним курсам.',
})
</script>

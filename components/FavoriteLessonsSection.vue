<template>
  <section
    v-if="favoriteLessons.length > 0"
    class="flex flex-col gap-y-3 mb-6"
  >
    <h3 class="font-semibold text-xl">
      Избранные уроки
    </h3>
    <FavoriteLessonCard
      v-for="entry in favoriteLessons"
      :key="entry.key"
      :entry="entry"
      @unfavorite="toggleFavorite"
    />
  </section>
</template>

<script setup lang="ts">
const { items: favoriteLessons, toggle: toggleFavorite } = useFavoriteLessons()
</script>

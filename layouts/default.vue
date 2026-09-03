<template>
  <TopNavbar />
  <main class="container mx-auto px-3 py-4 pb-20 md:pb-4">
    <slot />
    <SettingsDialog v-model:is-visible="isSettingsDialogVisible" />
  </main>
  <BottomNavbar />
</template>

<script setup lang="ts">
const isSettingsDialogVisible = useSettingsDialogVisibility()
</script>

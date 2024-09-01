<template>
  <div class="flex items-center gap-x-2">
    <ToggleSwitch input-id="force-desktop-view-toggle-switch" v-model="forceDesktopView"/>
    <label for="force-desktop-view-toggle-switch">Полная таблица</label>
  </div>
</template>

<script setup lang="ts">
const forceDesktopView = defineModel<boolean>()
</script>

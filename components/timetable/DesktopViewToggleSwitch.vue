<template>
  <div class="flex items-center gap-x-2">
    <ToggleSwitch
      v-model="forceDesktopView"
      input-id="force-desktop-view-toggle-switch"
    />
    <label for="force-desktop-view-toggle-switch">Полная таблица</label>
  </div>
</template>

<script setup lang="ts">
import ToggleSwitch from 'primevue/toggleswitch'

const forceDesktopView = defineModel<boolean>()
</script>

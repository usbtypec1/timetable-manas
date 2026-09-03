<template>
  <Navbar/>
  <main class="container mx-auto px-3 py-4 pb-20 md:pb-4">
    <slot/>
    <SettingsDialog v-model:is-visible="isSettingsDialogVisible"/>
  </main>
  <BottomNavbar/>
</template>

<script setup lang="ts">
import SettingsDialog from '~/components/dialogs/SettingsDialog.vue'

const isSettingsDialogVisible = useState('isSettingsDialogVisible', () => false)
</script>

<template>
  <Toolbar
    style="border-radius: 0; padding: 0"
  >
    <template #start>
      <div class="flex gap-x-2">
        <NuxtLink :to="{ name: 'index' }">
          <Button
            icon="pi pi-home"
            text
            label="Главная"
            outlined
          />
        </NuxtLink>
        <NuxtLink :to="{ name: 'multiple' }">
          <Button
            icon="pi pi-pencil"
            text
            label="Сравнить"
            outlined
          />
        </NuxtLink>
      </div>
    </template>
    <template #end>
      <Button
        icon="pi pi-cog"
        @click="isSettingsDialogVisible = true"
        text
      />
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
const isSettingsDialogVisible = useState('isSettingsDialogVisible', () => false)
</script>

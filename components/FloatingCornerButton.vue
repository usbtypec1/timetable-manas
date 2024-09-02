<template>
  <div class="fixed bottom-5 right-4">
    <NuxtLink :to="{ name: pageName }">
      <Button
        raised
        rounded
        size="large"
        icon="pi pi-arrow-left"
        :severity="severity"
      />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  severity: string,
  pageName: string,
}>()
</script>

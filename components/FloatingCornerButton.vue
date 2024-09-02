<template>
  <div class="fixed bottom-5 right-4">
    <Button class="my-4" raised rounded size="large" icon="pi pi-arrow-left" :severity="severity"/>
  </div>
</template>

<script setup lang="ts">
defineProps<{ severity: string }>()
</script>

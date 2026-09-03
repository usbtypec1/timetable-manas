<template>
  <nav
    class="md:hidden fixed bottom-0 inset-x-0 z-50 flex bg-white border-t border-gray-200"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.name"
      :to="{ name: item.name }"
      class="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs text-gray-500"
      :style="isActive(item.name) ? { color: 'var(--p-primary-color)' } : undefined"
    >
      <i :class="item.icon" class="text-xl"/>
      <span>{{ item.label }}</span>
    </NuxtLink>
    <button
      type="button"
      class="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs text-gray-500"
      @click="isSettingsDialogVisible = true"
    >
      <i class="pi pi-cog text-xl"/>
      <span>Настройки</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const isSettingsDialogVisible = useState('isSettingsDialogVisible', () => false)

const items = [
  { name: 'index', icon: 'pi pi-home', label: 'Главная' },
  { name: 'multiple', icon: 'pi pi-pencil', label: 'Сравнить' },
  { name: 'search', icon: 'pi pi-search', label: 'Поиск' },
]

const isActive = (name: string): boolean => route.name === name
</script>

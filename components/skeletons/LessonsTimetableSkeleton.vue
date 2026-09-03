<template>
  <div class="card">
    <DataTable :value="Array(4)">
      <Column
        v-for="columnName in columns"
        :key="columnName"
        :header="columnName"
      >
        <template #body>
          <Skeleton />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
const columns = [
  'Время',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
]
</script>

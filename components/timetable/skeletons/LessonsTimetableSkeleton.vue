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
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Skeleton from 'primevue/skeleton'

const columns = [
  'Время',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
]
</script>

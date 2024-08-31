<template>
  <h3 class="text-3xl font-semibold my-4">Расписание</h3>
  <DataTable
    :value="values"
  >
    <Column field="time" header="Время"/>
    <Column
      v-for="{ field, header } in columns"
      :key="field"
      :field="field"
      :header="header"
    >
      <template #body="{ data }">
        <div
          v-if="(data[field] ?? []).length >= 1"
        >
          <div
            v-for="{ departmentName, lesson } in data[field]"
            class="shadow-md my-2 rounded px-3 py-2"
            :class="typeToBackground[lesson.type]"
          >
            <p>{{ departmentName }}:</p>
            <p>{{ lesson.name }}</p>
            <p>{{ lesson.teacher }}</p>
            <p>{{ lesson.room }}</p>
          </div>
        </div>
        <div v-else>
          нет данных
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
const columns = [
  {
    field: 'monday',
    header: 'Понедельник',
  },
  {
    field: 'tuesday',
    header: 'Вторник',
  },
  {
    field: 'wednesday',
    header: 'Среда',
  },
  {
    field: 'thursday',
    header: 'Четверг',
  },
  {
    field: 'friday',
    header: 'Пятница',
  },
]

const values = [
  {
    time: '8:00-8:45',
    monday: [
      {
        departmentName: 'Программная инженерия',
        lesson: {
          name: 'Математический анализ',
          teacher: 'Иванов И.И.',
          room: 'А-101',
          type: 2,
        },
      },
      {
        departmentName: 'Информационные системы',
        lesson: {
          name: 'Математический анализ',
          teacher: 'Иванов И.И.',
          room: 'А-101',
          type: 2,
        },
      },
    ],
    friday: [
      {
        departmentName: 'Программная инженерия',
        lesson: {
          name: 'Математический анализ',
          teacher: 'Иванов И.И.',
          room: 'А-101',
          type: 2,
        },
      },
    ],
  },
  {
    time: '8:00-8:45',
    tuesday: [
      {
        departmentName: 'Программная инженерия',
        lesson: {
          name: 'Математический анализ',
          teacher: 'Иванов И.И.',
          room: 'А-101',
          type: 3,
        },
      },
    ],
  },
]

const typeToBackground = {
  1: 'bg-blue-300',
  2: 'bg-emerald-300',
  3: 'bg-amber-300',
  4: 'bg-gray-300',
}

</script>

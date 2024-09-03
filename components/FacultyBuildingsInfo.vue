<template>
  <h5 class="font-semibold text-lg">Обобзначения кодов здраний</h5>
  <p
    v-for="{ code, name } in buildings"
    :key="code"
  >
    {{ code }} - {{ name }}
  </p>
</template>

<script setup lang="ts">
const buildings: { code: string, name: string }[] = [
  { code: 'İİBF', name: 'здание факультета экономики' },
  { code: 'MFFB', name: 'здание инженерного факультета' },
  { code: 'KSSB', name: 'здание физкультуры, колледжа, рядом с sağlık merkezi' },
  { code: 'MYOB', name: 'здание колледжа' },
  { code: 'ZİRF', name: 'здание факультета агрономии' },
  { code: 'İLEF', name: 'здание факультета коммуникации' },
  { code: 'GZKM', name: 'здание факультета искусств' },
  { code: 'TEKM', name: 'здание колледжа/рядом с sağlık merkezi' },
  { code: 'TFB', name: 'здание факультета туризма' },
  { code: 'VETF', name: 'здание ветеринарного факультета' },
  { code: 'VETK', name: 'здание ветеринарного факультета' },
  { code: 'İLAH', name: 'здание факультета теологии' },
]
</script>

<template>
  <Inplace class="my-3">
    <template #display>
      <Button text icon="pi pi-info-circle" label="Обозначения цветов карточек"/>
    </template>
    <template #content>
      <div class="my-2">
        <p class="font-semibold text-lg">Обозначения цветов карточек</p>
        <p>Зеленый - обязательные уроки в рамках направления</p>
        <p>Синий - обязательные общие уроки</p>
        <p>Желтый - выборочные уроки в рамках направления</p>
        <p>Серый - выборочные уроки вне рамок направления</p>
      </div>
    </template>
  </Inplace>
</template>

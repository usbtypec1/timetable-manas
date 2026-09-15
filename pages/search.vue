<template>
  <div
    v-if="!SEARCH_ENABLED"
    class="flex flex-col items-center text-center py-20 gap-4"
  >
    <i class="pi pi-telegram text-5xl text-primary" />
    <h3 class="text-2xl font-semibold">
      Поиск предметов переехал в Telegram-бота
    </h3>
    <p class="text-surface-500 dark:text-surface-400 max-w-md">
      Ищите предметы, коды и преподавателей прямо в боте — это быстрее и всегда под рукой.
    </p>
    <Button
      as="a"
      href="https://t.me/manashelper"
      target="_blank"
      rel="noopener"
      icon="pi pi-telegram"
      label="Открыть бота"
    />
  </div>

  <div v-else>
    <h3 class="text-3xl font-semibold mt-4 mb-3">
      Поиск предметов
    </h3>

    <IconField class="w-full mb-2">
      <InputIcon class="pi pi-search" />
      <InputText
        v-model="query"
        placeholder="Предмет, код или преподаватель"
        class="w-full"
      />
    </IconField>

    <div class="flex items-center justify-between gap-3 mb-4 min-h-[2rem]">
      <p class="text-sm text-surface-500 dark:text-surface-400">
        {{ statusLabel }}
      </p>
      <Button
        icon="pi pi-refresh"
        text
        rounded
        size="small"
        severity="secondary"
        :loading="isBuildingIndex"
        :disabled="isBuildingIndex"
        title="Обновить базу предметов"
        @click="refreshIndex"
      />
    </div>

    <ProgressBar
      v-if="isBuildingIndex"
      mode="indeterminate"
      class="mb-4"
    />
    <Message
      v-else-if="hasLoadError"
      severity="warn"
      :closable="false"
      class="mb-4"
    >
      Часть курсов не загрузилась, результаты могут быть неполными
    </Message>

    <div
      v-if="query.trim().length === 0"
      class="flex flex-col items-center text-center text-surface-400 dark:text-surface-500 py-14 gap-2"
    >
      <i class="pi pi-search text-4xl" />
      <p>Начните вводить название предмета</p>
    </div>
    <div
      v-else-if="groupedResults.length === 0"
      class="flex flex-col items-center text-center text-surface-400 dark:text-surface-500 py-14 gap-2"
    >
      <i class="pi pi-inbox text-4xl" />
      <p>Ничего не найдено</p>
    </div>

    <div
      v-else
      class="flex flex-col gap-3"
    >
      <div
        v-for="group in groupedResults"
        :key="group.key"
        class="rounded-xl border border-surface-200 dark:border-surface-700 px-4 py-3 transition-shadow hover:shadow-md"
      >
        <div class="flex items-baseline gap-2 flex-wrap mb-1">
          <Tag
            v-if="group.code"
            :value="group.code"
            severity="secondary"
          />
          <p class="font-semibold">
            {{ group.title }}
          </p>
        </div>
        <p
          v-if="group.teacherName"
          class="text-sm text-surface-500 dark:text-surface-400 mb-2"
        >
          {{ group.teacherName }}
        </p>

        <div class="flex flex-col gap-y-1.5">
          <div
            v-for="occurrence in group.occurrences"
            :key="occurrence.key"
            class="text-sm flex flex-wrap items-center gap-x-3 gap-y-1 text-surface-600 dark:text-surface-300"
          >
            <span class="inline-flex items-center gap-1">
              <i class="pi pi-calendar text-xs" />
              {{ occurrence.weekdayLabel }}, {{ occurrence.period }}
            </span>
            <span
              v-if="occurrence.location"
              class="inline-flex items-center gap-1"
            >
              <i class="pi pi-map-marker text-xs" />
              {{ occurrence.location }}
            </span>
            <NuxtLink
              :to="{ name: 'courses-id', params: { id: occurrence.courseId } }"
              class="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
            >
              {{ occurrence.departmentName }}, {{ occurrence.courseNumber }} курс
              <i class="pi pi-arrow-up-right text-xs" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStorage, StorageSerializers } from '@vueuse/core'
import type { SearchableLesson } from '~/types/search'

useSeoMeta({
  title: 'Манас | Поиск предметов',
  description: 'Поиск предметов по названию, коду или преподавателю среди всех факультетов и направлений.',
})

// Disabled: this feature drove the Vercel edge request spike. Kept in place (unused) rather
// than deleted, in case it's revisited later. Users are redirected to the Telegram bot instead.
const SEARCH_ENABLED = false

interface Occurrence {
  key: string
  weekdayLabel: string
  period: string
  location: string
  courseId: number
  courseNumber: number
  departmentName: string
  facultyName: string
}

interface GroupedLesson {
  key: string
  code: string
  title: string
  teacherName: string
  occurrences: Occurrence[]
}

interface CachedState {
  version: number
  updatedAt: number
  lessons: SearchableLesson[]
}

// The full catalogue is built once server-side (see /api/search-index) and cached at the
// edge for a few hours, so this is just a light client-side cache on top of that to avoid
// re-fetching on every visit within the same browser.
const CACHE_MAX_AGE_MS = 1000 * 60 * 60
const CACHE_VERSION = 3
const STORAGE_KEY = 'search-index-cache-v3'

const query = ref<string>('')
const lessons = ref<SearchableLesson[]>([])
const isBuildingIndex = ref<boolean>(true)
const hasLoadError = ref<boolean>(false)

const cachedState = useStorage<CachedState | null>(STORAGE_KEY, null, undefined, {
  serializer: StorageSerializers.object,
})

const isReusableState = (state: CachedState | null): state is CachedState => {
  return !!state
    && state.version === CACHE_VERSION
    && Date.now() - state.updatedAt < CACHE_MAX_AGE_MS
}

const loadIndex = async (force = false): Promise<void> => {
  if (!force && isReusableState(cachedState.value)) {
    lessons.value = cachedState.value.lessons
    isBuildingIndex.value = false
    return
  }

  isBuildingIndex.value = true
  hasLoadError.value = false

  const settledChunks = await Promise.allSettled(
    searchIndexChunks.map((_, chunkIndex) =>
      $fetch<SearchableLesson[]>('/api/search-index', { query: { chunk: chunkIndex } }),
    ),
  )

  const fetchedLessons: SearchableLesson[] = []
  let anyChunkFailed = false

  for (const result of settledChunks) {
    if (result.status === 'fulfilled') {
      fetchedLessons.push(...result.value)
    }
    else {
      anyChunkFailed = true
    }
  }

  if (fetchedLessons.length > 0) {
    lessons.value = fetchedLessons
    cachedState.value = {
      version: CACHE_VERSION,
      updatedAt: Date.now(),
      lessons: fetchedLessons,
    }
  }
  else if (cachedState.value?.lessons) {
    lessons.value = cachedState.value.lessons
  }

  hasLoadError.value = anyChunkFailed
  isBuildingIndex.value = false
}

const refreshIndex = async (): Promise<void> => {
  if (isBuildingIndex.value) {
    return
  }
  await loadIndex(true)
}

onMounted(async () => {
  if (SEARCH_ENABLED) {
    await loadIndex()
  }
})

const formatRelativeTime = (timestamp: number): string => {
  const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' })
  const diffMinutes = Math.round((Date.now() - timestamp) / 60000)

  if (diffMinutes < 1) {
    return 'только что'
  }
  if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute')
  }
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour')
  }
  const diffDays = Math.round(diffHours / 24)
  return rtf.format(-diffDays, 'day')
}

const statusLabel = computed((): string => {
  if (isBuildingIndex.value) {
    return 'Собираем базу предметов…'
  }
  const updatedAt = cachedState.value?.updatedAt
  return updatedAt ? `Обновлено ${formatRelativeTime(updatedAt)}` : ''
})

const normalize = (value: string): string => (value ?? '').toLocaleLowerCase('tr')

const groupedResults = computed((): GroupedLesson[] => {
  const trimmedQuery = normalize(query.value.trim())
  if (!trimmedQuery) {
    return []
  }

  const matches = lessons.value.filter(lesson =>
    normalize(lesson.code).includes(trimmedQuery)
    || normalize(lesson.title).includes(trimmedQuery)
    || normalize(lesson.teacherName).includes(trimmedQuery),
  )

  const groups = new Map<string, GroupedLesson>()

  for (const lesson of matches) {
    const key = `${lesson.code}|${lesson.title}|${lesson.teacherName}`

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        code: lesson.code,
        title: lesson.title,
        teacherName: lesson.teacherName,
        occurrences: [],
      })
    }

    groups.get(key)!.occurrences.push({
      key: `${lesson.courseId}-${lesson.weekday}-${lesson.period}`,
      weekdayLabel: lesson.weekdayLabel,
      period: lesson.period,
      location: lesson.location,
      courseId: lesson.courseId,
      courseNumber: lesson.courseNumber,
      departmentName: lesson.departmentName,
      facultyName: lesson.facultyName,
    })
  }

  return Array.from(groups.values())
})
</script>

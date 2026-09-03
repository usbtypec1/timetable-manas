<template>
  <div>
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
      :value="indexingProgress"
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
import faculties from '~/assets/faculties.json'
import type { SearchableLesson } from '~/types/search'

useSeoMeta({
  title: 'Манас | Поиск предметов',
  description: 'Поиск предметов по названию, коду или преподавателю среди всех факультетов и направлений.',
})

interface FetchedLesson {
  courseId: number
  name: string
  teacherName: string
  location: string
  type: number
}

interface FetchedPeriodTimetable {
  period: string
  monday: FetchedLesson[]
  tuesday: FetchedLesson[]
  wednesday: FetchedLesson[]
  thursday: FetchedLesson[]
  friday: FetchedLesson[]
}

interface CourseInfo {
  courseId: number
  courseNumber: number
  departmentName: string
  facultyName: string
}

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
  chunkLessons: (SearchableLesson[] | null)[]
}

const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
// Kept small on purpose: each chunk is fetched in a single serverless request,
// and Vercel kills the function after 10s — a small chunk plus a per-course
// timeout in fetchAndParseTimetable keeps every request safely under that.
const CHUNK_SIZE = 4
const CHUNK_CONCURRENCY = 4
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 12
const CACHE_VERSION = 2
const STORAGE_KEY = 'search-index-cache-v2'

const weekdayToLabel: Record<string, string> = Object.fromEntries(
  weekdayOptions.map(({ value, label }) => [value, label]),
)

const getAllCourses = (): CourseInfo[] => {
  const courses: CourseInfo[] = []

  for (const faculty of faculties) {
    for (const department of faculty.departments) {
      for (const course of department.courses) {
        courses.push({
          courseId: course.id,
          courseNumber: course.number,
          departmentName: department.name,
          facultyName: faculty.name,
        })
      }
    }
  }

  return courses
}

const courses = getAllCourses()
const courseInfoById = new Map(courses.map(course => [course.courseId, course]))

const chunks: number[][] = []
for (let i = 0; i < courses.length; i += CHUNK_SIZE) {
  chunks.push(courses.slice(i, i + CHUNK_SIZE).map(course => course.courseId))
}

const toSearchableLessons = (periodTimetables: FetchedPeriodTimetable[]): SearchableLesson[] => {
  const result: SearchableLesson[] = []

  for (const periodTimetable of periodTimetables) {
    for (const weekday of WEEKDAY_KEYS) {
      for (const lesson of periodTimetable[weekday] ?? []) {
        const course = courseInfoById.get(lesson.courseId)
        if (!course) {
          continue
        }

        const { code, title } = parseLessonName(lesson.name)

        result.push({
          code,
          title,
          teacherName: lesson.teacherName,
          location: lesson.location,
          type: lesson.type,
          weekday,
          weekdayLabel: weekdayToLabel[weekday],
          period: periodTimetable.period,
          courseId: course.courseId,
          courseNumber: course.courseNumber,
          departmentName: course.departmentName,
          facultyName: course.facultyName,
        })
      }
    }
  }

  return result
}

const query = ref<string>('')
const lessons = ref<SearchableLesson[]>([])
const isBuildingIndex = ref<boolean>(true)
const hasLoadError = ref<boolean>(false)
const loadedChunkCount = ref<number>(0)
const totalChunkCount = chunks.length

const indexingProgress = computed((): number =>
  totalChunkCount === 0 ? 100 : Math.round((loadedChunkCount.value / totalChunkCount) * 100))

const cachedState = useStorage<CachedState | null>(STORAGE_KEY, null, undefined, {
  serializer: StorageSerializers.object,
})

const createEmptyState = (): CachedState => ({
  version: CACHE_VERSION,
  updatedAt: Date.now(),
  chunkLessons: chunks.map(() => null),
})

const isReusableState = (state: CachedState | null): state is CachedState => {
  return !!state
    && state.version === CACHE_VERSION
    && state.chunkLessons.length === chunks.length
    && Date.now() - state.updatedAt < CACHE_MAX_AGE_MS
}

const flattenChunkLessons = (chunkLessons: (SearchableLesson[] | null)[]): SearchableLesson[] => {
  return chunkLessons.filter((chunk): chunk is SearchableLesson[] => chunk !== null).flat()
}

const buildIndex = async (force = false): Promise<void> => {
  const state = !force && isReusableState(cachedState.value) ? cachedState.value! : createEmptyState()
  cachedState.value = state

  lessons.value = flattenChunkLessons(state.chunkLessons)
  loadedChunkCount.value = state.chunkLessons.filter(chunk => chunk !== null).length
  hasLoadError.value = false

  const pendingChunkIndexes = chunks
    .map((_, index) => index)
    .filter(index => state.chunkLessons[index] === null)

  if (pendingChunkIndexes.length === 0) {
    isBuildingIndex.value = false
    return
  }

  isBuildingIndex.value = true

  await mapWithConcurrency(pendingChunkIndexes, CHUNK_CONCURRENCY, async (chunkIndex) => {
    try {
      const periodTimetables = await $fetch<FetchedPeriodTimetable[]>('/api/timetable', {
        query: { courseId: chunks[chunkIndex] },
      })
      const chunkLessons = toSearchableLessons(periodTimetables)

      cachedState.value!.chunkLessons[chunkIndex] = chunkLessons
      cachedState.value!.updatedAt = Date.now()
      lessons.value = [...lessons.value, ...chunkLessons]
    }
    catch {
      hasLoadError.value = true
    }
    finally {
      loadedChunkCount.value++
    }
  })

  isBuildingIndex.value = false
}

const refreshIndex = async (): Promise<void> => {
  if (isBuildingIndex.value) {
    return
  }
  await buildIndex(true)
}

onMounted(async () => {
  await buildIndex()
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
    return `Собираем базу: ${loadedChunkCount.value}/${totalChunkCount}`
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

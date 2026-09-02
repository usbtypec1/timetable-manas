<template>
  <div>
    <Title>Манас | Поиск предметов</Title>

    <h3 class="text-3xl font-semibold my-4">Поиск предметов</h3>

    <p class="mb-4">
      Поиск ищет сразу по всем факультетам и направлениям. При первом заходе на этом устройстве
      сбор базы предметов может занять около минуты — дальше результат хранится в этом браузере
      и открывается мгновенно.
    </p>

    <InputText
      v-model="query"
      placeholder="Название, код или преподаватель"
      class="w-full mb-4"
    />

    <p v-if="isBuildingIndex">
      Собираем базу предметов, подождите… загружено {{ loadedChunkCount }} из {{ totalChunkCount }}.
      Прогресс сохраняется, можно спокойно перезагрузить или закрыть вкладку — при возврате сбор
      продолжится с того же места.
    </p>
    <p v-else-if="hasLoadError">
      Не удалось загрузить часть курсов, результаты поиска могут быть неполными
    </p>

    <p v-if="query.trim().length === 0">
      Введите название предмета, код или фамилию преподавателя
    </p>
    <p v-else-if="groupedResults.length === 0">Ничего не найдено</p>

    <div v-else class="flex flex-col gap-y-3">
      <div
        v-for="group in groupedResults"
        :key="group.key"
        class="shadow-md rounded px-4 py-3"
      >
        <p class="font-semibold">
          <span v-if="group.code">{{ group.code }} — </span>{{ group.title }}
        </p>
        <p v-if="group.teacherName" class="mb-2">{{ group.teacherName }}</p>

        <div class="flex flex-col gap-y-1">
          <div
            v-for="occurrence in group.occurrences"
            :key="occurrence.key"
            class="text-sm flex flex-wrap gap-x-1"
          >
            <span>{{ occurrence.weekdayLabel }}, {{ occurrence.period }}</span>
            <span v-if="occurrence.location">· {{ occurrence.location }}</span>
            <span>·</span>
            <NuxtLink
              :to="{ name: 'courses-id', params: { id: occurrence.courseId } }"
              class="underline"
            >
              {{ occurrence.facultyName }}, {{ occurrence.departmentName }}, {{ occurrence.courseNumber }} курс
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
import { parseLessonName } from '~/utils/lesson-name'
import { mapWithConcurrency } from '~/utils/concurrency'
import { weekdayOptions } from '~/utils/weekdays'
import type { SearchableLesson } from '~/types/search'

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
const CHUNK_SIZE = 6
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
const courseInfoById = new Map(courses.map((course) => [course.courseId, course]))

const chunks: number[][] = []
for (let i = 0; i < courses.length; i += CHUNK_SIZE) {
  chunks.push(courses.slice(i, i + CHUNK_SIZE).map((course) => course.courseId))
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

const buildIndex = async (): Promise<void> => {
  const state = isReusableState(cachedState.value) ? cachedState.value : createEmptyState()
  cachedState.value = state

  lessons.value = flattenChunkLessons(state.chunkLessons)
  loadedChunkCount.value = state.chunkLessons.filter((chunk) => chunk !== null).length
  hasLoadError.value = false

  const pendingChunkIndexes = chunks
    .map((_, index) => index)
    .filter((index) => state.chunkLessons[index] === null)

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
    } catch {
      hasLoadError.value = true
    } finally {
      loadedChunkCount.value++
    }
  })

  isBuildingIndex.value = false
}

onMounted(async () => {
  await buildIndex()
})

const normalize = (value: string): string => (value ?? '').toLocaleLowerCase('tr')

const groupedResults = computed((): GroupedLesson[] => {
  const trimmedQuery = normalize(query.value.trim())
  if (!trimmedQuery) {
    return []
  }

  const matches = lessons.value.filter((lesson) =>
    normalize(lesson.code).includes(trimmedQuery) ||
    normalize(lesson.title).includes(trimmedQuery) ||
    normalize(lesson.teacherName).includes(trimmedQuery),
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

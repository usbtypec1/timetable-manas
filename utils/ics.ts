import type { Lesson, PeriodTimetable } from '~/types/timetable'

type WeekdayField = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

const weekdayFields: WeekdayField[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const weekdayFieldToJsDay: Record<WeekdayField, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
}

const weekdayFieldToIcsDay: Record<WeekdayField, string> = {
  monday: 'MO',
  tuesday: 'TU',
  wednesday: 'WE',
  thursday: 'TH',
  friday: 'FR',
}

const pad = (value: number): string => String(value).padStart(2, '0')

const formatIcsUtc = (date: Date): string =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
  + `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`

const parsePeriodTimes = (period: string): {
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
} | undefined => {
  const match = period.trim().match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/)
  if (!match) {
    return undefined
  }
  const [, startHour, startMinute, endHour, endMinute] = match
  return {
    startHour: Number(startHour),
    startMinute: Number(startMinute),
    endHour: Number(endHour),
    endMinute: Number(endMinute),
  }
}

// Bishkek (GMT+6) has no DST, so the local wall-clock time can be converted to UTC with a fixed offset
const bishkekWallTimeToUtcDate = (year: number, month: number, date: number, hour: number, minute: number): Date =>
  new Date(Date.UTC(year, month, date, hour - 6, minute))

const getDateOfWeekdayInCurrentBishkekWeek = (targetJsDay: number, bishkekNow: Date): {
  year: number
  month: number
  date: number
} => {
  const diff = targetJsDay - bishkekNow.getUTCDay()
  return {
    year: bishkekNow.getUTCFullYear(),
    month: bishkekNow.getUTCMonth(),
    date: bishkekNow.getUTCDate() + diff,
  }
}

const escapeIcsText = (text: string): string =>
  text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

const MAX_ICS_LINE_LENGTH = 73

// Folds long lines per RFC 5545 (continuation lines start with a space)
const foldIcsLine = (line: string): string => {
  if (line.length <= MAX_ICS_LINE_LENGTH) {
    return line
  }
  const chunks: string[] = []
  let start = 0
  while (start < line.length) {
    const chunkSize = start === 0 ? MAX_ICS_LINE_LENGTH : MAX_ICS_LINE_LENGTH - 1
    chunks.push(line.slice(start, start + chunkSize))
    start += chunkSize
  }
  return chunks.join('\r\n ')
}

const hashString = (input: string): string => {
  let hash = 0
  for (let index = 0; index < input.length; index++) {
    hash = (hash * 31 + input.charCodeAt(index)) | 0
  }
  return (hash >>> 0).toString(16)
}

export const countLessons = (
  periodTimetables: PeriodTimetable[],
  predicate: (lesson: Lesson) => boolean,
): number => {
  let count = 0
  for (const periodTimetable of periodTimetables) {
    for (const weekdayField of weekdayFields) {
      for (const lesson of periodTimetable[weekdayField]) {
        if (predicate(lesson)) {
          count++
        }
      }
    }
  }
  return count
}

export interface BuildTimetableIcsOptions {
  periodTimetables: PeriodTimetable[]
  shouldIncludeLesson: (lesson: Lesson) => boolean
  courseIdToDepartmentName: Record<string, string>
  showDepartmentNames: boolean
}

export const buildTimetableIcs = ({
  periodTimetables,
  shouldIncludeLesson,
  courseIdToDepartmentName,
  showDepartmentNames,
}: BuildTimetableIcsOptions): string => {
  const bishkekNow = getBishkekNow()
  const dtstamp = formatIcsUtc(new Date())

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//manas-timetable//ics-export//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const periodTimetable of periodTimetables) {
    const times = parsePeriodTimes(periodTimetable.period)
    if (!times) {
      continue
    }

    for (const weekdayField of weekdayFields) {
      for (const lesson of periodTimetable[weekdayField]) {
        if (!shouldIncludeLesson(lesson)) {
          continue
        }

        const { year, month, date } = getDateOfWeekdayInCurrentBishkekWeek(
          weekdayFieldToJsDay[weekdayField],
          bishkekNow,
        )
        const dtstart = bishkekWallTimeToUtcDate(year, month, date, times.startHour, times.startMinute)
        const dtend = bishkekWallTimeToUtcDate(year, month, date, times.endHour, times.endMinute)

        const departmentName = courseIdToDepartmentName[lesson.courseId]
        const summary = showDepartmentNames && departmentName
          ? `${departmentName} — ${lesson.name}`
          : lesson.name

        const uid = `${hashString(`${getLessonKey(lesson)}-${weekdayField}-${periodTimetable.period}`)}@manas-timetable`

        lines.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${dtstamp}`,
          `DTSTART:${formatIcsUtc(dtstart)}`,
          `DTEND:${formatIcsUtc(dtend)}`,
          `RRULE:FREQ=WEEKLY;BYDAY=${weekdayFieldToIcsDay[weekdayField]}`,
          foldIcsLine(`SUMMARY:${escapeIcsText(summary)}`),
          foldIcsLine(`LOCATION:${escapeIcsText(lesson.location ?? '')}`),
          foldIcsLine(`DESCRIPTION:${escapeIcsText(`Преподаватель: ${lesson.teacherName ?? ''}`)}`),
          'END:VEVENT',
        )
      }
    }
  }

  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

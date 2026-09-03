import { ofetch } from 'ofetch'
import * as cheerio from 'cheerio'
import type { AnyNode } from 'domhandler'

export interface RawLesson {
  courseId: number
  name: string
  teacherName: string
  location: string
  type: number
}

export interface RawPeriodTimetable {
  period: string
  monday: RawLesson[]
  tuesday: RawLesson[]
  wednesday: RawLesson[]
  thursday: RawLesson[]
  friday: RawLesson[]
}

const lessonTypeByBackgroundColor: Record<string, number> = {
  '#ffeeba': 1,
  '#c3e6cb': 2,
  '#b8daff': 3,
  '#d6d8db': 4,
}

const getLessonType = (lessonCardCss: Record<string, string> | undefined): number => {
  return lessonTypeByBackgroundColor[lessonCardCss?.['background-color'] ?? '']
}

const parseLessonCard = (courseId: number, lessonCard: AnyNode): RawLesson => {
  const divHtml = cheerio.load(lessonCard)('div')
  const type = getLessonType(divHtml.css())

  const [name, teacherName, location] = (divHtml.html() ?? '').split('<br>')

  return {
    courseId,
    name,
    teacherName,
    location,
    type,
  }
}

const parseLessonsColumn = (courseId: number, tableData: cheerio.Cheerio<AnyNode>): RawLesson[] => {
  const lessons: RawLesson[] = []
  for (const div of tableData.find('div')) {
    lessons.push(parseLessonCard(courseId, div))
  }
  return lessons
}

export const parseTimetablePageHtml = (courseId: number, html: string): RawPeriodTimetable[] => {
  const result: RawPeriodTimetable[] = []

  const $ = cheerio.load(html)
  const tableRows = $('tr')

  for (const tableRow of tableRows.slice(1)) {
    const tr = cheerio.load(tableRow)

    const periodTd = tr('td:first')
    const mondayTd = periodTd.next()
    const tuesdayTd = mondayTd.next()
    const wednesdayTd = tuesdayTd.next()
    const thursdayTd = wednesdayTd.next()
    const fridayTd = thursdayTd.next()

    result.push({
      period: periodTd.text(),
      monday: parseLessonsColumn(courseId, mondayTd),
      tuesday: parseLessonsColumn(courseId, tuesdayTd),
      wednesday: parseLessonsColumn(courseId, wednesdayTd),
      thursday: parseLessonsColumn(courseId, thursdayTd),
      friday: parseLessonsColumn(courseId, fridayTd),
    })
  }
  return result
}

const SOURCE_REQUEST_TIMEOUT_MS = 6000

export const fetchAndParseTimetable = async (courseId: number): Promise<RawPeriodTimetable[]> => {
  const { manasTimetableBaseUrl } = useRuntimeConfig()
  const response = await ofetch(manasTimetableBaseUrl + courseId, {
    timeout: SOURCE_REQUEST_TIMEOUT_MS,
  })
  return parseTimetablePageHtml(courseId, response)
}

export const mergeTimetables = (timetables: RawPeriodTimetable[]): RawPeriodTimetable[] => {
  const periodToLessons: Record<string, RawPeriodTimetable> = {}

  for (const timetable of timetables) {
    if (!periodToLessons[timetable.period]) {
      periodToLessons[timetable.period] = {
        period: timetable.period,
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      }
    }
    periodToLessons[timetable.period].monday.push(...timetable.monday)
    periodToLessons[timetable.period].tuesday.push(...timetable.tuesday)
    periodToLessons[timetable.period].wednesday.push(...timetable.wednesday)
    periodToLessons[timetable.period].thursday.push(...timetable.thursday)
    periodToLessons[timetable.period].friday.push(...timetable.friday)
  }

  return Object.values(periodToLessons)
}

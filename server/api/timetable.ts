import { ofetch } from 'ofetch'
import * as cheerio from 'cheerio'
import { Period, PeriodTimetable } from '~/types/timetable'

const getLessonType = lessonCardCss => {
  const lessonTypeToType = {
    '#ffeeba': 1,
    '#c3e6cb': 2,
    '#b8daff': 3,
    '#d6d8db': 4,
  }
  return lessonTypeToType[lessonCardCss['background-color']]
}

const parseLessonCard = (courseId: number, lessonCard) => {
  const divHtml = cheerio.load(lessonCard)('div')
  const type = getLessonType(divHtml.css())

  const [name, teacherName, location] = divHtml.html().split('<br>')

  return {
    courseId,
    name,
    teacherName,
    location,
    type,
  }
}

const parseLessonsColumn = (courseId: number, tableData) => {
  const lessons = []
  for (const div of tableData.find('div')) {
    lessons.push(parseLessonCard(courseId, div))
  }
  return lessons
}

const parsePeriod = periodTd => {
  const [start, end] = periodTd.text().split('-')
  return { start, end }
}

const parseTimetablePageHtml = (courseId: number, html: string) => {
  const result = []

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

const fetchAndParseTimetable = async (courseId: number) => {
  const response = await ofetch('http://timetable.manas.edu.kg/department-printer/' + courseId)
  return parseTimetablePageHtml(courseId, response)
}

const mergeTimetables = (timetables: PeriodTimetable[]) => {
  const periodToLessons: Record<string, PeriodTimetable> = {}

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

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  let courseIds
  if (typeof queryParams.courseId === 'string') {
    courseIds = [parseInt(queryParams.courseId)]
  } else if (Array.isArray(queryParams.courseId)) {
    courseIds = queryParams.courseId.map(Number)
  } else {
    throw new Error('Invalid query param')
  }

  const responses = await Promise.all(courseIds.map(fetchAndParseTimetable))
  return mergeTimetables(responses.flat())
})

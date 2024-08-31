import { ofetch } from 'ofetch'
import * as cheerio from 'cheerio'

const getLessonType = lessonCardCss => {
  const lessonTypeToType = {
    '#ffeeba': 1,
    '#c3e6cb': 2,
  }
  return lessonTypeToType[lessonCardCss['background-color']]
}

const parseLessonCard = (lessonCard) => {
  const divHtml = cheerio.load(lessonCard)('div')
  const type = getLessonType(divHtml.css())

  const [name, teacherName, location] = divHtml.html().split('<br>')

  return {
    name,
    teacherName,
    location,
    type,
  }
}

const parseLessonsColumn = (tableData) => {
  const lessons = []
  for (const div of tableData.find('div')) {
    lessons.push(parseLessonCard(div))
  }
  return lessons
}

const parsePeriod = periodTd => {
  const [start, end] = periodTd.text().split('-')
  return { start, end }
}

const parseTimetablePageHtml = html => {
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
      period: parsePeriod(periodTd),
      monday: parseLessonsColumn(mondayTd),
      tuesday: parseLessonsColumn(tuesdayTd),
      wednesday: parseLessonsColumn(wednesdayTd),
      thursday: parseLessonsColumn(thursdayTd),
      friday: parseLessonsColumn(fridayTd),
    })
  }
  return result
}


export async function GET(request) {
  const url = new URL(request.url)
  const departmentId = url.searchParams.get('departmentId')

  try {
    const response = await ofetch('http://timetable.manas.edu.kg/department-printer/' + departmentId)
    const parsedData = parseTimetablePageHtml(response)
    return new Response(JSON.stringify(parsedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const errorOptions = {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    return new Response(JSON.stringify({ error: 'Unknown error' }), errorOptions)
  }
}
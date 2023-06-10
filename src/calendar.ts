import ical, { ICalCalendarProdIdData } from 'ical-generator'
import { Client, APIErrorCode } from '@notionhq/client'
import { notFound } from './router.ts'

export async function getCalendar(
  databaseId: string,
  notionToken: string,
  prodId: ICalCalendarProdIdData,
) {
  const notionData = await getNotionData(databaseId, notionToken)
  if (notionData === null) return notFound()

  const { databaseTitle, events } = notionData
  const cal = ical({ name: databaseTitle, prodId })
  // TODO: Does not take into account timezone property of notion date
  for (let { id, url, title, date, location } of events) {
    const allDay = date.start.length === 10
    const startDate = new Date(date.start)
    const endDate = date.end && new Date(date.end)

    cal.createEvent({
      id,
      summary: title,
      start: startDate,
      end: getEndDate({ start: startDate, end: endDate, allDay }),
      allDay,
      url,
      location,
    })
  }
  return new Response(cal.toString(), {
    headers: { 'Content-Type': 'text/calendar' },
  })
}

function getEndDate({ start, end, allDay }): Date | undefined {
  if (end) {
    const endDate = new Date(end)
    if (allDay) {
      endDate.setDate(endDate.getDate() + 1)
    }
    return endDate
  }
  if (allDay) {
    return undefined
  }

  // Make events 1 hour long if no end date is specified
  const endDate = new Date(start)
  endDate.setUTCHours(endDate.getUTCHours() + 1)
  return endDate
}

async function getNotionData(databaseId: string, notionToken: string) {
  const notion = new Client({ auth: notionToken })
  try {
    const database = await notion.databases.retrieve({ database_id: databaseId })

    const databaseTitle = database.title[0].plain_text
    const datePropName = Object.values(database.properties).find(
      ({ name, type }) => type === 'date',
    ).name
    if (!datePropName) throw { code: 'no_date' }
    const propertyNames = {
      date: datePropName,
      location: ['select', 'rich_text'].includes(database.properties.Location?.type)
        ? 'Location'
        : null,
    }
    const entries = []
    let start_cursor = undefined
    do {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor,
      })
      start_cursor = response.next_cursor
      entries.push(...response.results)
    } while (start_cursor)
    // const events = entries
    const events = entries.map(({ id, url, properties }) => {
      const location = properties[propertyNames.location]
      const { start, end } = properties[propertyNames.date].date
      return {
        id,
        url,
        title: properties.Name.title[0].plain_text,
        date: { start, end },
        location: location.select?.name || location.rich_text?.[0].plain_text || null,
      }
    })

    return { databaseTitle, events }
  } catch (error) {
    if (error.code === APIErrorCode.ObjectNotFound) {
      return null
    }
    throw error
  }
}

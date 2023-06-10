import ical, { ICalCalendarProdIdData } from 'ical-generator'
import { notFound } from './router'
import { getNotionData } from './notion'

export async function getCalendar(notionData, prodId: ICalCalendarProdIdData): string {
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
  return cal.toString()
}

function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date)
  newDate.setUTCHours(newDate.getUTCHours() + 1)
  return newDate
}

function addDays(date: Date, hours: number): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + 1)
  return newDate
}

function getEndDate({ start, end, allDay }): Date | undefined {
  // If it is all day, and an end is specified, add a day, because it is exclusive.
  // Otherwise do not specify an end date.
  if (allDay) return end ? addDays(end, 1) : undefined

  // Make events 1 hour long if no end date is specified
  return end ?? addHours(start, 1)
}

import ical, { ICalCalendarProdIdData } from 'ical-generator'
import { notFound } from './router'
import { getNotionData } from './notion'

export async function getCalendar(
  notionData,
  prodId: ICalCalendarProdIdData,
  defaultEventDuration: number,
): string {
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
      end: getEndDate(startDate, endDate, allDay, defaultEventDuration),
      allDay,
      url,
      location,
    })
  }
  return cal.toString()
}

function getEndDate(
  start: Date,
  end: Date,
  allDay: boolean,
  defaultDuration: number,
): Date | undefined {
  // If it is all day, and an end is specified, add a day, because it is exclusive.
  // Otherwise do not specify an end date.
  if (allDay) return end ? addDays(end, 1) : undefined

  // Add a default duration of no end is specified
  return end ?? (defaultDuration ? addMinutes(start, defaultDuration) : undefined)
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

function addDays(date: Date, days: number): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

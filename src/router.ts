import { Router } from 'itty-router'
import { getCalendar } from './calendar'
import { getNotionData } from './notion'

const UUID_REGEX = /^[0-9a-f]{12}[1-5][0-9a-f]{3}[89ab][0-9a-f]{15}$/i

const router = Router()

export function notFound() {
  return new Response('404 Not Found', { status: 404 })
}

// GET item
router.get(
  '/calendar/:databaseId.ics',
  async (
    { params },
    { NOTION_TOKEN, ICALENDAR_PRODID_COMPANY, ICALENDAR_PRODID_PRODUCT, DEFAULT_EVENT_DURATION },
  ) => {
    const { databaseId } = params
    if (!UUID_REGEX.test(databaseId)) return notFound()

    const notionData = await getNotionData(databaseId, NOTION_TOKEN)
    if (notionData === null) return notFound()

    const calendarString = await getCalendar(
      notionData,
      {
        company: ICALENDAR_PRODID_COMPANY,
        product: ICALENDAR_PRODID_PRODUCT,
      },
      DEFAULT_EVENT_DURATION,
    )
    return new Response(calendarString, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          notionData.databaseTitle,
        )}"`,
      },
    })
  },
)

// 404 for everything else
router.all('*', notFound)

export default router

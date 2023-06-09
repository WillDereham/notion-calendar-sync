import { Router } from 'itty-router'
import { getCalendar } from './calendar'

const UUID_REGEX = /^[0-9a-f]{8}[0-9a-f]{4}[1-5][0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}$/i

const router = Router()

export function notFound() {
	return new Response('404 Not Found', { status: 404 })
}

// GET item
router.get(
	'/calendar/:databaseId.ics',
	async ({ params }, { NOTION_TOKEN, ICALENDAR_PRODID_COMPANY, ICALENDAR_PRODID_PRODUCT }) => {
		const { databaseId } = params
		if (!UUID_REGEX.test(databaseId)) return notFound()
		return await getCalendar(databaseId, NOTION_TOKEN, {
			company: ICALENDAR_PRODID_COMPANY,
			product: ICALENDAR_PRODID_PRODUCT,
		})
	},
)

// 404 for everything else
router.all('*', notFound)

export default router

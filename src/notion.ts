import { Client, APIErrorCode } from '@notionhq/client'

export async function getNotionData(databaseId: string, notionToken: string) {
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

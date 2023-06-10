# Notion Calendar Sync integration

Cloudflare worker to generate a calendar subscription for a Notion database.

## Prerequisites

- Git
- Cloudflare Account
- Notion Integration - [generate an _internal integration secret_](https://developers.notion.com/docs/create-a-notion-integration)
- Yarn (not tested with NPM)

## Instructions

Clone the repository and install dependencies.

```
git clone git@github.com:WillDereham/notion-calendar-sync.git
yarn install
```

Deploy with wranglers.

```
yarn deploy
```

Generate a secret (keep this for later), and upload it.

```
yarn generate-secret
yarn set-secret
```

Upload the Notion integration token.

```
yarn set-notion-token
```

The ICS feed should become available at

```
https://<worker url>/calendar/<notion database id>.ics?secret=<secret key>
```

This can then be added to the calendar application of choice as a _calendar subscription_ or similar.

The database ID can be found in the URL of the database and is a UUID without hyphens.

If you want to host it locally, copy the file `.dev.vars.example` to `.dev.vars` and replace the secrets. Run with `yarn start`.

## Default duration

If the Notion event doesn't specify an end date, the integration will give it a default duration of 60 minutes. This duration is set in `wrangler.toml`, under `DEFAULT_EVENT_DURATION`. If set to 0, it will not add a default end date.

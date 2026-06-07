# hashnode-preview

> A preview service for freeCodeCamp.org news for posts on Hashnode (headless) CMS.

This uses Hashnode's GraphQL API and Nunjucks to render an approximate preview
of a post as it will appear when published live on `/news`.

## Environment variables

Copy `.env.sample` to `.env` and fill in the values:

| Variable         | Description                                                                                                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`           | Port the server listens on (defaults to `3000`).                                                                                                                                                                                        |
| `HASHNODE_HOST`  | The publication host from the Hashnode dashboard (e.g. `fcc.hashnode.dev`).                                                                                                                                                             |
| `HASHNODE_TOKEN` | A Hashnode [personal access token](https://hashnode.com/settings/developer). **Required to preview drafts** — Hashnode's `draft` query is authenticated and returns `UNAUTHENTICATED` without it. Published posts work without a token. |

> [!NOTE]
> A personal access token is tied to the account that created it and can expire
> or be revoked. If draft previews start failing with an `UNAUTHENTICATED`
> error, regenerate the token and update `HASHNODE_TOKEN`.
>
> For the production app, the token is kept in the team password manager and set
> as an encrypted environment variable in the DigitalOcean App Platform settings.
> Update it in both places when rotating.

## Development

> [!WARNING]
> Please note that changes to the nunjucks templates will not be reflected in the watch mode.

```bash
pnpm install
pnpm run start
```

## Deployment

- The app is deployed on DigitalOcean App Platform, and all changes merged to
  the `main` branch are deployed using the
  [`deploy.yml`](.github/workflows/deploy.yml) workflow.

- Alternatively, you can run the app using the included `docker-compose.yml` file.

  ```bash
  docker compose build
  docker compose up -d
  ```

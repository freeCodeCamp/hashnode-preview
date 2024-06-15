# hashnode-preview

> A preview service for freeCodeCamp.org news for posts on Hashnode (headless) CMS.

This uses Hashnode's GraphQL API and Nunjucks to render an approximate preview
of a post as it will appear when published live on `/news`.

## Development

> [!WARNING]
> Please note that changes to the nunjucks templates will not be reflected in the watch mode.

```bash
pnpm install
pnpm run start
```

## Usage

- The app is deployed on DigitalOcean App Platform, and all changes merged to
  the `main` branch are deployed using the
  [`deploy.yml`](.github/workflows/deploy.yml) workflow.

- Alternatively, you can run the app using the included `docker-compose.yml` file.

  ```bash
  docker compose build
  docker compose up -d
  ```

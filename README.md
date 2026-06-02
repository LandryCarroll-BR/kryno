# shadcn/ui monorepo template

This is a React Router monorepo template with shadcn/ui.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Local Postgres

Kryno's local persistence loop uses Docker Compose with non-secret development credentials. Copy `.env.example` into your local environment when you need database-backed development.

```bash
pnpm run db:up
```

The local database runs on `localhost:5432` with `DATABASE_URL=postgres://kryno:kryno@localhost:5432/kryno`.

Use the reset command when you want to discard local database state and recreate the `kryno` database:

```bash
pnpm run db:reset
```

Drizzle Studio is available as optional inspection tooling:

```bash
pnpm run db:studio
```

Migrations are explicit and owned by the database composition module. Generate reviewed migration SQL from the merged Kryno schema, then run migrations deliberately:

```bash
pnpm run db:generate
pnpm run db:migrate
```

The application should not run migrations on app startup.

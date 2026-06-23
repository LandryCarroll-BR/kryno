# Kryno

A climbing app built with Next.js, Effect, Drizzle, and PostgreSQL.

## Architecture

Kryno is a clean architecture modular monolith. Each domain lives in `modules/` with its application, infrastructure, adapters, and UI kept separate.

Create a module with:

```sh
pnpm turbo gen module
```

## UI

The project uses Tailwind CSS for styling and shadcn/ui for reusable components. Shared components and global styles live in `packages/ui` and are imported through `@packages/ui`.

Add shadcn components from the repository root:

```sh
pnpm dlx shadcn@latest add button -c packages/ui
```

## Development

Requires Node.js 24+, pnpm 11, and Docker.

Create the required local environment files:

```sh
cp apps/web/.env.example apps/web/.env
cp modules/auth/infrastructure/.env.example modules/auth/infrastructure/.env
cp modules/climbing/infrastructure/.env.example modules/climbing/infrastructure/.env
```

`AUTH_DATABASE_URL` connects the web app and auth migrations to PostgreSQL. `CLIMBING_DATABASE_URL` connects the climbing migrations. The examples contain the credentials created by `docker-compose.yml`.

```sh
pnpm install
pnpm run db:up
pnpm run db:auth:migrate
pnpm run db:climbing:migrate
pnpm run dev
```

Open [localhost:3000](http://localhost:3000).

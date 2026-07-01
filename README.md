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
cp modules/gym/infrastructure/.env.example modules/gym/infrastructure/.env
```

`AUTH_DATABASE_URL`, `CLIMBING_DATABASE_URL`, and `GYM_DATABASE_URL` connect the web app and each module's migrations to PostgreSQL. The examples contain the credentials created by `docker-compose.yml`.

```sh
pnpm install
pnpm run db:up
pnpm run db:auth:migrate
pnpm run db:climbing:migrate
pnpm run db:gym:migrate
pnpm run dev
```

Open [localhost:3000](http://localhost:3000).

## Auth Resources

The authentication implementation was informed by [Lucia Auth](https://lucia-auth.com/) and [Pilcrow's Auth Book](https://auth.pilcrowonpaper.com/), which were used as educational resources and implementation guides.

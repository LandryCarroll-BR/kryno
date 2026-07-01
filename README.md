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

`AUTH_DATABASE_URL`, `CLIMBING_DATABASE_URL`, and `GYM_DATABASE_URL`
connect the web app to PostgreSQL. Each infrastructure package also has a
`*_MIGRATION_DATABASE_URL`; locally it points to the same database, while
deployed environments use separate direct and pooled connections.

```sh
pnpm install
pnpm run db:up
pnpm run db:auth:migrate
pnpm run db:climbing:migrate
pnpm run db:gym:migrate
pnpm run dev
```

Open [localhost:3000](http://localhost:3000).

## Deployment

Kryno deploys as a Next.js application on Vercel with Supabase providing
PostgreSQL. It connects directly to PostgreSQL and does not use Supabase Auth or
the Supabase JavaScript client. Its tables live in the private `kryno_auth`,
`kryno_climbing`, and `kryno_gym` schemas; the prefix avoids collisions with
Supabase-managed schemas such as `auth`.

### Supabase

1. Create a Supabase project in the same region as the Vercel functions. The
   committed Vercel configuration uses Washington, D.C. (`iad1`), so a US East
   Supabase project is the default pairing.
2. Replace the three `CHANGE_ME` passwords in
   [`deployment/supabase/bootstrap.sql`](deployment/supabase/bootstrap.sql),
   then run the file once in the Supabase SQL editor. Keep the generated
   passwords outside the repository.
3. Copy Supabase's direct connection host and configure each infrastructure
   package with its module role. Direct URLs are used only for migrations:

   ```env
   AUTH_MIGRATION_DATABASE_URL=postgresql://auth_role:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
   CLIMBING_MIGRATION_DATABASE_URL=postgresql://climbing_role:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
   GYM_MIGRATION_DATABASE_URL=postgresql://gym_role:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
   ```

   Percent-encode passwords when placing them in a URL.
4. Apply migrations from a trusted development or CI environment:

   ```sh
   pnpm run db:auth:migrate
   pnpm run db:climbing:migrate
   pnpm run db:gym:migrate
   ```

Do not run migrations as part of the Vercel build. A deployment and migration
should be promoted as separate release steps.

### Vercel

Import the repository and configure the project with:

- Root Directory: `apps/web`
- Framework Preset: Next.js
- Node.js: 24.x
- Include source files outside of the Root Directory: enabled
- `ENABLE_EXPERIMENTAL_COREPACK=1` so Vercel honors the committed pnpm version

The application uses Supabase's transaction pooler for runtime traffic. Add
these encrypted Vercel environment variables, using each custom role's password
and the pooler host shown by Supabase:

```env
AUTH_DATABASE_URL=postgresql://auth_role.<project-ref>:<password>@<pooler-host>:6543/postgres?sslmode=require
CLIMBING_DATABASE_URL=postgresql://climbing_role.<project-ref>:<password>@<pooler-host>:6543/postgres?sslmode=require
GYM_DATABASE_URL=postgresql://gym_role.<project-ref>:<password>@<pooler-host>:6543/postgres?sslmode=require
DATABASE_MAX_CONNECTIONS=2
```

Set the variables separately for Production and Preview. Preview deployments
should use a staging Supabase project rather than the production database. If
Supabase is outside US East, update `regions` in
[`apps/web/vercel.json`](apps/web/vercel.json) to the closest Vercel function
region.

## Auth Resources

The authentication implementation was informed by [Lucia Auth](https://lucia-auth.com/) and [Pilcrow's Auth Book](https://auth.pilcrowonpaper.com/), which were used as educational resources and implementation guides.

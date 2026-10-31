# MultiBiz

MultiBiz tracks the money and progress of several small projects/activities (livestock batches,
a laying flock, buy-resell, or any simple activity) under one organization — an immutable history
of flux (sales, expenses, investments, owner contributions, headcount, production) per project,
with computed results: cumulative result, invested capital recovered, a verdict
(starting/profitable/watch/loss), and "Ma poche" (the owner's money across all projects). See
`docs/audit-architecture.md` for the rationale behind this model and `docs/maquette/` for the
authoritative UI spec (read `docs/maquette/README.md` first — it's a precise screen-by-screen
spec, not a rough guide). Later phases add resources/stock, planning, and a task list — the
architecture below is deliberately chosen to support those without rework.

A web app (Inertia + React, this repo) and a React Native mobile app with offline mode (future,
in `/mobile`) share one Laravel backend. The mobile app talks to a versioned push/pull sync API;
the web app never does.

## Monorepo layout

```
multibiz/
├── backend/              Laravel app (PHP, Inertia, React, Tailwind) — see below
│   └── docker-compose.yml   PostgreSQL + Redis for backend/ (see "Running the app")
├── mobile/               React Native app (not started yet)
├── packages/
│   └── shared-types/     TypeScript types generated from backend/app/Domain/*/Data DTOs
├── docs/adr/             Architecture Decision Records — read these for the "why"
├── docs/audit-architecture.md   Rationale for the current domain model (projects/entries)
└── docs/maquette/        Authoritative visual/UX spec for every web screen — read before
                          building or changing a page
```

Root-level `.gitignore` covers editor/AI-tool directories shared across the monorepo;
`backend/.gitignore` covers Laravel/Node build artifacts local to the backend.

## Architecture rules (non-negotiable — read the ADRs in `docs/adr/` for rationale)

1. **Domain-oriented structure.** Business logic lives under
   `backend/app/Domain/{Identity,Organization,Project,Finance,Analytics,Sync}`, each with
   `Models/`, `Actions/`, `Data/`, `Policies/`, `Enums/`, `Services/` as needed. Don't put business
   logic in controllers, models, or framework-level `app/Http` code.
2. **Thin controllers, shared Actions.** `app/Http/Web/Controllers` (Inertia) and
   `app/Http/Api/Controllers/V1` (JSON, for the mobile app) both call the **same**
   `app/Domain/*/Actions` classes. A controller validates, calls one Action, returns a response —
   nothing else. See ADR 0001 and 0002.
3. **Money is integer minor units, never float.** Use `App\Support\Money`, backed by `bigint`
   columns. See ADR 0005.
4. **Flux (`entries`) are append-only — never updated, never deleted.** Enforced at the model
   layer by the `App\Domain\Sync\Concerns\AppendOnly` trait (throws on `updating`/`deleting`), not
   just the Policy. A mistake is corrected by recording the arithmetic inverse via
   `App\Domain\Finance\Actions\ReverseEntry` (`reverses_entry_id`), never by mutating the original
   row. Corollary: nothing computed from `entries` (result, capital recovered, verdict, headcount,
   lay rate, Ma poche) is ever stored — always recompute from the registry
   (`app/Domain/Analytics/Services`).
5. **`occurred_at` vs `recorded_at` vs `created_at`/`updated_at`.** `occurred_at` is the
   real-world, user-editable date of the business event. `recorded_at` is when the device/user
   actually captured it (relevant once offline mobile entry exists — the two can differ).
   `created_at`/`updated_at` are purely technical and never shown to users as "when this
   happened."
6. **Every organization-owned table carries `organization_id` (directly, or via `project_id`),
   plus a nullable `created_by`** (FK to `users`).
7. **Authorization is always through Policies**, scoped to the acting user's organization *and*
   their role in it (`owner`/`manager`/`entry`/`viewer` — see
   `App\Domain\Organization\Enums\Role`). A user must never read or write another organization's
   data — this is a cross-cutting concern covered heavily in tests, not something checked ad hoc
   in controllers. `entry` can record flux but has no access to Ma poche/analytics; only
   `owner`/`manager` can create or archive projects and categories.

## Sync foundations (mobile offline support)

- Every synced, mutable model uses the `Syncable` trait (`app/Domain/Sync/Concerns`): UUID primary
  keys, `SoftDeletes`, and a `version` bigint column populated from the global Postgres sequence
  `sync_version_seq` on every save (see ADR 0003). `entries` use `AppendOnly` instead (same
  UUID/`version` mechanism, but no `SoftDeletes` — see rule 4 above).
- `SyncRegistry` (not built yet) will map entity names (`"projects"`, `"entries"`, ...) to model
  class, the fields a client may mutate, and the Action to call per operation type.
- `POST /api/sync/push` (not built yet) will apply a batch of
  `{op_id, entity, entity_id, type, fields, client_ts}` operations, each in its own transaction,
  idempotent via `processed_operations`, with field-level last-write-wins (ADR 0004) — never
  full-row overwrite.
- `GET /api/sync/pull?since=<version>&limit=500` (not built yet) will return rows (including
  soft-deleted) with `version > since` for the user's organization, plus `max_version` and
  `has_more`.
- What *does* exist today: `app/Http/Api/Controllers/V1` + `routes/api.php` — a Sanctum
  token-authenticated skeleton (`POST /api/v1/login`, `GET /api/v1/projects`,
  `POST /api/v1/entries`, idempotent via `processed_operations`) that calls the same Actions as
  the web controllers. This is a plain write endpoint, not the sync protocol above.

## Backend conventions

- PHP 8.3+, Laravel (latest stable), PostgreSQL, Redis.
- Auth: Sanctum — session guard for the web app, personal access tokens for the mobile API.
- DTOs: `spatie/laravel-data`, also used as the source for generated TypeScript types
  (`spatie/laravel-typescript-transformer`) in `backend/resources/js/types/generated` and
  `packages/shared-types`.
- UI language is French; default currency is Ariary (MGA), set per organization
  (`organizations.currency`, also `timezone`). Format amounts like
  `1 250 000 Ar` (thin space as thousands separator, real minus sign U+2212 for negatives — see
  `docs/maquette/README.md` for the full number-formatting spec).
- Inertia.js + React (TypeScript, strict) + Tailwind CSS, living in `backend/resources/js`,
  originally based on the Laravel React starter kit but since redesigned per `docs/maquette/`
  (Geist/Geist Mono fonts, custom tokens, custom SVG charts — no charting library). Two-factor
  auth and WebAuthn passkeys that shipped with the starter kit were intentionally removed —
  login/register/logout only.

## Running the app

`backend/docker-compose.yml` runs the whole stack in containers: `pgsql`, `redis`, `app` (PHP,
`php artisan serve`), `queue` (`php artisan queue:listen`), and `vite` (the dev server, with HMR
on port 5173). The point of this setup is that PHP and Node never need to be installed on the
host — every command (artisan, composer, pest, npm, wayfinder) runs inside the containers via
`docker compose exec <service> <command>`, never directly on the host (see "Run everything
inside the containers" below for why).

```bash
cd backend
cp .env.example .env               # first time only
docker compose up -d               # builds the app/queue images on first run
```

The `app`/`queue` images are built from `docker/php/Dockerfile`; `docker/php/entrypoint.sh` runs
`composer install` (into the `multibiz-vendor` volume), generates `APP_KEY` if missing, and runs
migrations on every boot. The `vite` service runs `npm install` (into the `multibiz-node-modules`
volume) then `npm run dev` on container start — no separate seed/migrate/`composer run dev` step
needed. Run `docker compose exec app php artisan db:seed` once if you want demo data.

The app is served at the URL in `APP_URL` (`http://localhost:8000` by default). Inside the
containers, `DB_HOST`/`REDIS_HOST` are overridden in `docker-compose.yml` to the service names
(`pgsql`/`redis`) on the Docker network — `backend/.env` itself still points `DB_HOST`/
`REDIS_HOST` at `127.0.0.1` via `FORWARD_DB_PORT` (`54320`) and `FORWARD_REDIS_PORT` (`63790`),
in case a host-installed tool ever needs to reach Postgres/Redis directly — because this machine
already runs unrelated containers on the default 5432/6379 ports. Check `backend/.env` and
`backend/docker-compose.yml` together before assuming either set of ports elsewhere.

**Run everything inside the containers, not on the host.** `app`, `queue`, and `vite` all run as
root and bind-mount the repo (`.:/var/www/html`); a host-installed PHP/Node process writing to
the same paths — e.g. `resources/js/actions`/`resources/js/routes` (gitignored, regenerated by
`wayfinder:generate`, and also auto-regenerated by the `vite` container's dev server on file
changes) — fights the containers for file ownership and produces permission-denied errors on
whichever side runs second. Always use `docker compose exec app <command>` for PHP/artisan/
composer/pest and `docker compose exec vite <command>` for npm — see the Commands table below.

`vendor/bin/pest` needs the `pgsql` container running too: the sync version sequence (ADR 0003)
is Postgres-only DDL, so tests run against a real Postgres database — a separate `testing`
database on the same container (auto-created by `docker/postgres/create-testing-database.sql` on
first boot; already-running containers got it created manually once, see git history). Tests
don't touch your seeded dev data: `testing` is a distinct database from `laravel`.

## Commands

Run via `docker compose exec <service> <command>` from `backend/` (needs `docker compose up -d`
first) — never directly on the host, see "Run everything inside the containers" above:

| Purpose | Command |
|---|---|
| Run tests | `docker compose exec app vendor/bin/pest` (or `php artisan test`) |
| Static analysis | `docker compose exec app vendor/bin/phpstan analyse --memory-limit=512M` (Larastan, level 7; default 128M limit is too low for this codebase) |
| Format PHP | `docker compose exec app vendor/bin/pint` (check-only: `... pint --test`) |
| Frontend lint/format | `docker compose exec vite npm run check` (fix: `... npm run check:fix`) |
| TypeScript type-check | `docker compose exec vite npm run types:check` |
| Generate TS types from PHP DTOs | `docker compose exec app php artisan typescript:transform` |
| Generate Wayfinder route/controller helpers | `docker compose exec app php artisan wayfinder:generate --with-form` (also runs automatically on `npm run build`/`dev` inside the `vite` container; `--with-form` avoids stripping existing `.form()` helpers) |
| Everything CI runs | `docker compose exec app composer ci:check` |

## Current status

The repo was reset to a bare skeleton on 2026-10-24 (Identity + Organization + Fortify auth only)
and is being rebuilt feature by feature — most of what a mature MultiBiz needs (Finance,
Analytics, Sync, and everything in `docs/audit-architecture.md`'s model beyond `Project` itself)
does not exist yet. Check this section (and the git log) before assuming any feature described
elsewhere in this file is actually present.

**Domain model** (`app/Domain/*`): `Identity` (`User` — bigint id, Fortify/Sanctum, not UUID/
Syncable) and `Organization` (`Organization` UUID PK with `currency`/`timezone`,
`OrganizationPolicy::accessPocket`) are built and tested. `Project` now exists too: `Project`
(UUID PK) with `project_template` (enum `lots`/`herd`/`resale`/`simple`, each with a
`ProjectTemplateData` definition — description, examples, advantages, default modules, tabs),
`status`, `graph_color` (`ProjectColor`, one of 6, reserved per organization once chosen),
`started_on`, `seed_budget`, `goal_type`/`goal_target`/`goal_due_on` (`ProjectGoalType`; `target`
is minor-units money for the monetary goal types, a plain number otherwise), `modules`
(`ProjectModule` catalog — `lots`/`animals`/`weight`/`sales`/`stock`) and a `settings` JSON column
reserved for later per-project verdict thresholds (unused so far). `ProjectPolicy::create` gates
project creation to the owner/manager roles. **`Finance`, `Analytics`, `Sync` domains and the
`Batch`/`Milestone`/`Category`/`Entry`/`Attachment` models still don't exist** — rule 4's
`AppendOnly` trait and anything computed from entries (result, verdict, capital recovered, Ma
poche) come with them. Covered by Pest tests under `tests/Feature/{Auth,Organization,Project}`,
including cross-organization Policy denial and role-based access.

**Known architecture gap vs. rule 2 above:** every web controller currently lives flat in
`app/Http/Controllers` (`DashboardController`, `OrganizationController`, `ProjectController`), not
under `app/Http/Web/Controllers`, and `routes/api.php` is empty (no `app/Http/Api/Controllers/V1`
either). Follow this existing flat convention for new web controllers rather than inventing a
`Web/` subfolder for a single controller — doing the real Web/Api split is its own task.

**Not built yet / known gaps:**
- No project show/detail page (`/projects/{project}`), batches list, project settings, history,
  pocket, analysis, or tasks screens — only organization onboarding, the dashboard placeholder,
  and the project-creation wizard exist so far. `docs/maquette/README.md` §4 (the screens → routes
  table) is the authoritative checklist of what Phase-1 screens remain.
- The project-creation wizard deliberately skips two things from `docs/maquette/README.md` §5's
  "Nouveau projet" spec because they have no persistence target yet: step 2's "unit" question
  (e.g. "Bande"/"Lot"/"Cycle" for the `lots` template — depends on how `Batch` ends up modeled)
  and the optional note that's meant to become the project's first `Milestone`. Revisit both once
  those domains exist, rather than inventing a settings-JSON stand-in now.
- No draft-autosave (localStorage) on the project wizard, unlike the maquette's "brouillon
  enregistré" indicator — a progressive enhancement, not required for creation to work.
- The mobile sync protocol (`SyncRegistry`, `/api/sync/push`, `/api/sync/pull`) and the
  `app/Http/Api/Controllers/V1` skeleton mentioned in "Sync foundations" above — not rebuilt yet.

**Frontend** (`backend/resources/js`): the design system (tokens, Geist fonts, component library —
`choice-card`, `switch`, `project-avatar`, `progress-bar`, custom SVG charts, etc. — see
`docs/maquette/README.md` §3) is in place, with a local-only `/_dev/ui` page demoing every
component in light/dark. Pages built: `auth/*` (login/register/password reset/email verify,
`AuthLayout`), `organization/create` (onboarding), `dashboard/index` (placeholder), and
`projects/create` (the 3-step wizard from `docs/maquette/README.md` §5, its own `WizardLayout`
registered in `app.tsx` and driven by `setLayoutProps` for the per-step title/breadcrumbs).
Everything else in the maquette's §4 routes table is still a gap.

Registering only creates a bare `User` (Fortify's `CreateNewUser`) — creating the `Organization`
is a separate onboarding step once logged in (`EnsureUserHasNoOrganization`/
`EnsureUserHasOrganization` middleware, `App\Domain\Organization\Actions\CreateOrganization`),
and creating a `Project` is a further step once the user has an organization
(`App\Domain\Project\Actions\CreateProject`, gated by `ProjectPolicy`).

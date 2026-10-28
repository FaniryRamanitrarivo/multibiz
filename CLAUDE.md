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

**Domain model** (`app/Domain/*`) is built and tested: `Organization` (UUID PK, `currency`/
`timezone`) with an `organization_user` pivot carrying a role
(owner/manager/entry/viewer); `Project` (`model` enum lots/herd/resale/simple, `status`,
`started_on`, `settings` JSON — per-project verdict thresholds live here), `Batch` ("bande" — a
cohort for `lots` projects), `Milestone`; `Category` (income/expense/investment,
archive/unarchive, no hard delete) and the append-only `Entry` registry (rule 4 above) with
`ReverseEntry` for corrections; `Analytics\Services\{ProjectResult,ProjectVerdict,BatchStats,
HerdStats,PocketSummary,DashboardStats}` computing everything on read, nothing stored. All of this
is covered by Pest tests (`tests/Feature/{Organization,Project,Finance,Analytics}`), including
cross-organization Policy denial and role-based access (e.g. `entry` role denied Ma poche/
analytics).

**Not built yet / known gaps:**
- `Attachment` (receipt photo on an entry): model + migration exist, but no controller, route, or
  upload UI — not usable today.
- No backend route for a dedicated batches list/detail page or a project-settings page (verdict
  threshold editor) — `BatchController` only has `store`/`close`, no `index`/`show`.
- The mobile sync protocol (`SyncRegistry`, `/api/sync/push`, `/api/sync/pull`) — see "Sync
  foundations" above, Phase 5.
- `DashboardStats` takes a period range as a parameter but the web controller/page don't yet
  expose a period picker (Depuis le début/6 mois/30 jours) — always whatever the controller
  hardcodes.

**Frontend** (`backend/resources/js`) is mid-rebuild against `docs/maquette/`: the design system
(tokens, Geist fonts, component library — `stat-tile`, `segmented-control`, `verdict-badge`,
custom SVG charts, etc. — see `docs/maquette/README.md` §3) is in place, with a local-only
`/_dev/ui` page demoing every component in light/dark. Pages built: login/register,
`/projects/create` (3-step wizard), `/dashboard`, `/history` (filterable), `/pocket`,
`/projects/{project}` (model-aware, but not yet the full tabbed layout the maquette specifies).
`docs/maquette/README.md` §4 (the screens → routes table) is the authoritative checklist for what
Phase-1 screens remain — currently missing: project settings, a dedicated batches page, and the
dashboard's period picker/per-project trajectory sparkline. `/analysis` and `/tasks` are
deliberate `coming-soon` placeholders (Phase 3, per the maquette).

Registering creates an `Organization` + membership in one step —
`App\Domain\Identity\Actions\RegisterOrganizationAndUser`, wired into Fortify's `CreateNewUser`.

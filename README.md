# FITAI

FITAI is being migrated from its original HTML/CSS/JavaScript prototype into a modular, full-stack nutrition application. The original `index.html`, `styles.css`, and `app.js` remain intact as the visual/behavior reference; prototype food values and local-only authentication are not production services.

## Current migration slice

- Next.js App Router + TypeScript foundation; the new app imports the existing visual system.
- Dedicated `/login` and `/signup` pages backed by server-managed Supabase signup, sign-in, sign-out, protected routes, and an option-led, goal-first onboarding screen.
- A draft additive PostgreSQL/RLS migration with age-band safeguards. It has **not** been applied to a database.
- An authenticated server-side USDA FoodData Central search adapter that returns source identity/metadata only, plus a deterministic portion calculator that preserves unknown facts as unavailable.
- A maintained audit register with reproduction steps, root causes, priorities, verification evidence, and unresolved blockers: [`docs/bug-register.md`](docs/bug-register.md).
- Architecture, phase gates, and explicit blockers: [`docs/architecture.md`](docs/architecture.md), [`docs/migration-plan.md`](docs/migration-plan.md), [`docs/production-blockers.md`](docs/production-blockers.md).
- An additive Expo + React Native + TypeScript scaffold in [`apps/mobile`](apps/mobile/README.md). It is a foundation only: no connected auth/product flows and no iOS/Android native build or device test has been completed. Cross-platform audit and gates: [`docs/mobile-migration-audit.md`](docs/mobile-migration-audit.md).

The full dashboard, target calculations, profile persistence verification, meal/recipe/shake logging, nutrition detail normalization, recommendations, AI, and production operations remain incomplete. No sample nutrition totals are shown as user data.

## Requirements

- Node.js 22.13+ (pinned locally by `.nvmrc` to 22.23.3).
- npm 11.6.0 (recorded in the root `packageManager` field).
- A Supabase project is required to exercise authentication. Review and apply migrations only to a disposable development project first; do not use production credentials for local development.

## Local setup

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
npm run dev
```

The application binds to `0.0.0.0:3000` for preview environments. With no Supabase credentials, auth and protected flows show explicit setup errors; they do not create fake accounts or local sessions. The onboarding save route requires the draft Supabase migration to have been applied in the development project.

To start the native-app development server, use a second terminal and run `npm run dev:mobile`. This opens the Expo developer tooling for an iOS Simulator or Android Emulator/device. The Expo app currently displays a clearly labeled foundation screen only; successful JS bundling is not a native build or platform-support claim.

For USDA search, set `USDA_FDC_API_KEY` in the **server** environment; it must not be prefixed with `NEXT_PUBLIC_`. USDA search is only discovery metadata at this stage, not a calculation-ready nutrient record.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm audit --audit-level=moderate
```

The build script selects Next.js's Webpack production bundler explicitly. The last recorded Webpack production build passed before the mobile workspace was added. Since the workspace/dependency alignment, repeated production-build attempts have been OOM-killed in this sandbox before compiler diagnostics; Turbopack and Webpack development previews were also OOM-killed, so no web preview is currently active. Re-run the build and route smoke in a higher-memory environment before further structural changes. The current workspace `npm audit` reports 30 findings (11 moderate, 19 high, 0 critical), including Expo/Metro and React Native dependency advisories; do not use `npm audit fix --force` as it proposes incompatible downgrades. Lint is scoped to the migrated `src/` tree so the preserved vanilla prototype is not mechanically rewritten.

## Data and security status

No database migration has been applied, and no production database, USDA data key, AI key, or hosting project is configured. Do not deploy, purchase a service, or run destructive/production migrations without explicit approval. The AI variables are placeholders only; no model is called. See [`docs/migration-plan.md`](docs/migration-plan.md) for current blockers and unfinished acceptance criteria.

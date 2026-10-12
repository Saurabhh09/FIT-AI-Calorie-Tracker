# FITAI migration plan

The existing HTML/CSS/JavaScript prototype remains the visual and behavior reference. It is preserved in the repository until each replacement flow has been implemented and checked; prototype-only data and fake/local authentication are not promoted into production.

## Phase status — 2026-10-04

| Phase | Scope | Status / exit criteria |
|---|---|---|
| 1. Audit | Inventory UI, behaviors, data, security gaps, and tooling | **Complete for this slice.** The initial migration audit made no source edits; the follow-up audit and its reproduced issues/fixes are recorded in `docs/bug-register.md`. Prototype-only risks and blocked checks remain listed there. |
| 2. Architecture | Choose modular monolith, framework, auth/database boundary, nutrition truth model, source strategy | **Complete as a working ADR draft** in `docs/architecture.md`. User selected Global / USDA-first. |
| 3. Foundation | Next.js/TypeScript structure, environment templates, lint/test/build scripts | **Complete for local foundation.** Typecheck, lint, test, webpack production build, and dependency audit passed. Build success is not product readiness. |
| 4. Design-system and route migration | Port components and screens in small slices: shared shell, auth, option-led onboarding, dashboard, food/recipe/shake calculators, tracking | **In progress.** Dedicated `/login` and `/signup` routes and a goal-first, option-led onboarding slice reuse the original CSS. Dashboard/plan/meal screens and remaining interactions are not migrated. |
| 5. Data and domain | Supabase migrations/RLS, user/profile/preferences, food-source records, deterministic nutrition services, requirements provenance, recipes/meals | **In progress.** An initial additive schema draft exists but is not applied. A pure portion calculator and USDA search metadata normalizer are implemented and tested; there are no production food facts or requirement targets. |
| 6. Authentication and persistence | Real Supabase Auth sessions, email flows, profile/goal persistence, ownership checks, export/deletion | **Partially implemented.** Supabase SSR signup/login/logout routes, bounded JSON/form parsing, auth route regression tests, a Next 16 Proxy session-refresh path, and an onboarding RPC call are present. Proxy cookie wiring is unit-tested, but no Supabase project is configured, so real auth, token rotation, RLS, and persistence have not been exercised. Password reset, account lifecycle, and durable rate limiting remain. |
| 7. Food search and calculations | Server-side FDC adapter, source metadata, search/detail normalization, portion calculations, nutrient comparisons | **In progress.** Authenticated server-side USDA search returns source IDs/metadata only. No detail fetch, gram-basis normalization, caching, ingestion, or real food database is complete. The deterministic calculator rejects invalid weights and preserves unavailable values as `null`. |
| 8. AI interpretation and recommendations | Server-only AI adapter, constrained structured outputs, ingredient confirmation, allergy guardrails, budget-aware suggestions | **Not started.** AI variables are placeholders; no model is called. |
| 9. Verification and release readiness | Unit/integration/E2E tests, accessibility/privacy/security review, setup/deploy/backup docs, staged migration rehearsal | **Not started.** Domain, provider normalizer, request-origin, auth payload/route, Supabase config, and Proxy cookie unit/regression tests exist; no live database integration, browser E2E, responsive/accessibility pass, or staged migration rehearsal exists. |

## Acceptance criteria for the eventual end state

- [ ] Screens and interactions are migrated from the existing prototype, not redesigned from scratch.
- [ ] Goal-first, option-led onboarding with explanatory screens and under-18 safeguards.
- [ ] Real managed authentication, email verification/reset, server-side session checks, and user-isolated persistence.
- [ ] Deterministic meal/recipe/shake/day calculations based on sourced, normalized records; missing data stays visibly missing.
- [ ] Global/USDA-first food discovery with provider provenance and a documented path for non-US foods.
- [ ] Requirements comparisons are jurisdiction- and population-specific, with source and date.
- [ ] Meal logging, hydration, check-ins, preferences, budget-aware suggestions, and food restrictions persist safely.
- [ ] AI interpretation is server-side, structured, time-bounded, rate/cost controlled, and cannot override data or restrictions.
- [ ] Tests cover calculations, missing values, authorization/RLS, provider parsing, and critical user journeys.
- [ ] `.env.example`, setup, migration, deployment, backup/recovery, privacy, and production-blocker documentation.
- [ ] No deployment, paid-service purchase, production database mutation, or destructive migration without explicit approval.

## Current blockers / not yet configured

No Supabase project, USDA API key, AI provider/key, production hosting project, or production dataset is configured in the workspace. The SQL file `supabase/migrations/202610030001_initial_schema.sql` is a draft and has **not** been executed. These are setup dependencies, not reasons to insert placeholder credentials or simulated success paths. A future release also needs decisions on age-data verification/minimization, consent/retention, durable rate limits, jurisdictional nutrition references, RLS tests, and operational monitoring. The itemized release gate is tracked in [`docs/production-blockers.md`](production-blockers.md).

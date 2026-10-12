# FITAI target architecture (ADR draft)

**Status:** working architecture proposal for the migration; user-selected food-data direction is recorded, while credentials and operational choices remain unconfigured.  
**Date:** 2026-10-03  
**Initial food-data priority:** global / USDA FoodData Central first (selected during the audit).

## 1. Architecture decision

Use a **modular monolith** rather than microservices:

- **Application:** Next.js App Router, React, TypeScript; server components for reads, route handlers/server actions for validated mutations.
- **UI:** preserve the existing FITAI CSS tokens and visual language; migrate screens into feature components incrementally. Tailwind is available for new layout work, but the existing design system should not be mechanically rewritten.
- **Identity and data:** Supabase Auth + PostgreSQL. Application queries use a user-scoped Supabase server client and Row Level Security. No service-role key in browser code.
- **Validation:** Zod at request boundaries and for external provider responses.
- **Nutrition domain:** pure deterministic TypeScript functions, independent of Next, Supabase, and AI SDKs.
- **Food data:** server-only USDA FoodData Central adapter. Store provider/source IDs and the raw source record; normalize only documented nutrient bases/servings. USDA search results are discovery metadata, not a verified per-100 g nutrition record by themselves.
- **AI:** separate server-side `MealInterpreter` / recommendation interface. It returns candidate ingredients, amounts, and explanations; the deterministic nutrition service resolves values and calculates totals. If AI is not configured or uncertain, return an explicit error/confirmation state.
- **Testing:** Vitest for pure domain code; integration tests for route/database behavior; Playwright for critical browser journeys once the application shell is in place.

## 2. Trust boundaries and data flow

1. Browser sends a small, validated request to a same-origin Next route.
2. Route authenticates the Supabase user and derives `user_id` from the session; never trust a submitted owner ID.
3. Zod validates payloads. Route calls a feature service.
4. Feature service uses a user-scoped database client/RLS for owned rows, or a server-only provider client for USDA.
5. Nutrition services operate on normalized, source-attributed facts and preserve unknowns as `null`/unavailable.
6. AI receives only the minimum input needed and cannot supply final nutrient arithmetic.
7. Responses disclose estimates, source, serving basis, and unavailable facts.

## 3. Proposed module boundaries

```text
src/
  app/                         # routes, layouts, route handlers
  components/                  # shared accessible UI
  features/
    auth/ onboarding/ dashboard/ nutrition/ food-search/
    meal-calculator/ shake-calculator/ recipes/ tracking/
    recommendations/ profile/
  lib/
    env/ supabase/ validation/ errors/
  services/
    nutrition/ food-data/ ai/ recommendations/
  types/
  utils/
supabase/
  migrations/
  seed/                        # clearly marked non-production fixtures only
```

Business rules belong in feature/domain services, not React components or prompt text.

## 4. Initial relational model

The migration will use UUID primary keys and UTC timestamps. Core tables:

- `profiles` references `auth.users`; the initial schema stores a selected age band (not a full date of birth), optional reference group, country, and unit preference to minimize sensitive data.
- `user_goals`, `weight_entries`, `diet_preferences`, `user_allergies`, and `user_budgets` represent user-owned preferences and check-ins.
- `foods` stores source identifiers, source/data type, description, brand, raw-source metadata, fetch/verification status, and serving basis.
- `nutrients` stores stable nutrient identifiers, canonical units, and category; `food_nutrients` stores amounts with a documented basis and source.
- `food_servings` and `food_brands` preserve serving/brand distinctions.
- `recipes` and `recipe_ingredients` use gram quantities and links to foods.
- `meals` and `meal_items` store dated user logs; meal items persist only a food/recipe source ID and weighed quantity, not client-supplied nutrient totals. Referenced food records are source-versioned, and used recipes are frozen to preserve historical calculations.
- `nutrition_requirements` and `requirement_sources` represent jurisdiction-, age-, and population-scoped reference values, not universal prescriptions.
- `food_prices` stores dated price observations by region/currency/source; `recommendations` stores generated suggestions and the constraints/source snapshot used.

Every user-owned table gets RLS policies. Provider data is not user-owned; write access is restricted to a server-side ingestion path. Migrations are additive and reversible where practical. No nutrition rows are seeded as real data without a cited source.

## 5. USDA FoodData Central integration

Use FDC's search and detail endpoints through a server adapter; keep the Data.gov API key in `USDA_FDC_API_KEY`. Track `fdcId`, data type, description, brand owner, source URI, fetch time, and raw payload version. Add caching/rate control before production traffic. The source requires a Data.gov key; USDA documents search/detail endpoints, rate limits, and public-domain/CC0 status in its [API guide](https://fdc.nal.usda.gov/api-guide/).

The prototype's embedded `FOOD_DB` values are not authoritative source records and must not be imported into production tables. The selected USDA-first scope may not provide adequate local coverage for every Indian prepared dish; add another licensed/verified source adapter if product coverage requires it.

## 6. Security and privacy baseline

- Supabase Auth; server-side session validation on protected routes.
- RLS on every user-owned row; tests for cross-user access.
- Public anon key only in client; no privileged service key in browser bundles.
- Input validation, request size limits, rate limits, safe error mapping, and timeouts for provider/AI calls.
- Do not log passwords, tokens, full birth dates, allergy/health answers, or complete meal descriptions by default.
- Add consent, account deletion, and export paths before launch. Review whether exact date of birth and health-context fields are necessary.
- Set CSP/security headers and audit dependencies before deployment.

## 7. Non-goals for the first migration slice

No microservices, production deployment, real user seeding, AI-generated nutrient values, or live database mutation without credentials and an approved migration run. AI vendor, hosting project, retention policy, and production monitoring provider remain separate configuration/approval decisions.

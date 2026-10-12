# FITAI audit bug register

**Audit date:** 2026-10-04 (Asia/Kolkata)  
**Scope:** Existing FITAI repository and the additive Expo foundation batch completed after the cross-platform plan was approved. The Next.js App Router remains at the repository root and the root `index.html`/`app.js` remains a preserved, non-production prototype. No production database, deployment, or destructive migration was touched.

## Severity and status

- **P0:** critical security/data-integrity failure on an active production surface; stop release.
- **P1:** core flow, safety, privacy, or release-blocking defect.
- **P2:** material but non-critical functional, reliability, or verification issue.
- **P3:** minor/edge-case issue.
- A *confirmed code defect* is distinguished from a *conditional prototype risk* and from a *blocked verification*. These categories are not counted interchangeably.

## Baseline before fixes

- `npm run typecheck` — passed.
- `npm run lint` — passed (`eslint src`; the preserved vanilla prototype is not linted by this script).
- `npm test` — passed: 4 files, 16 tests.
- `npm audit --audit-level=moderate` — passed: 0 vulnerabilities.
- `node --check app.js` — passed (syntax only; not a browser behavior test).
- HTTP smoke: `/`, `/login`, and `/signup` each returned 200.
- Login API reproduction used dummy values only: `{email,password}` reached the expected unconfigured-auth 503; the exact hydrated-form payload, which also included `name: ""`, returned 422 before Supabase was called.
- Native URL-encoded login submission returned 415 (`Content-Type must be application/json`).
- A successful Webpack build existed before this audit; the current post-fix build result is recorded below after final verification.

## Prioritized findings

### FIT-001 — Login form payload was rejected by the strict login schema

- **Severity:** P1
- **Location:** `src/features/auth/auth-form.tsx`; `src/features/auth/auth-payload.ts`; `src/app/api/auth/login/route.ts`
- **Description:** The login UI previously sent `name: ""`; the `.strict()` login schema accepts only `email` and `password`, so every hydrated login attempt was rejected before Supabase.
- **Reproduction:** Baseline POST of `{name:"",email:"audit@example.invalid",password:"audit-only-password"}` returned HTTP 422; the same body without `name` passed validation and reached the expected HTTP 503 configuration response.
- **Root cause:** Signup and login payloads were built identically despite different server schemas.
- **Impact:** Configured users could not sign in through the normal UI.
- **Fix:** Added `buildAuthPayload()`; it includes a name only for signup and keeps the server schema strict.
- **Dependencies:** None for the code fix. Real credential validation still needs Supabase configuration.
- **Verification:** Regression tests assert exact login/signup payloads; login route test confirms `{email,password}` passes schema validation. Post-fix HTTP smoke returns 503 for valid-shaped JSON because auth is intentionally unconfigured, not 422.
- **Status:** **Fixed and locally verified.** Real sign-in remains externally blocked.

### FIT-002 — Protected Server Components could not persist refreshed Supabase cookies

- **Severity:** P1
- **Location:** `src/lib/supabase/server.ts`; `src/lib/supabase/config.ts`; `src/lib/supabase/proxy.ts`; `src/lib/supabase/proxy-cookies.ts`; `src/proxy.ts`
- **Description:** The Server Component cookie adapter catches writes that cannot be persisted from a read-only render context. There was no Next 16 Proxy to refresh the session and return rotated cookies before protected pages rendered.
- **Reproduction:** Baseline code-path inspection found protected pages calling `auth.getUser()`, swallowed Server Component cookie writes, and no `proxy.ts`/`middleware.ts`. A live expired-session reproduction was blocked by the missing Supabase project.
- **Root cause:** Missing SSR session-refresh response-cookie handling.
- **Impact:** Expired/rotated sessions could leave the browser with stale cookies and cause repeated failures or unexpected sign-outs.
- **Fix:** Added a narrowly matched Next Proxy for `/dashboard/*` and `/onboarding/*`; it validates/refreshes via `getUser()`, updates forwarded request cookies, returns refreshed cookies and Supabase cache headers, and leaves page-level authorization checks in place. API responses are marked private/no-store.
- **Dependencies:** Supabase environment for true expiry/rotation verification.
- **Verification:** Mocked Proxy regression verifies `getUser()` triggers cookie propagation and cache headers; cookie helper test passes; `npm run build` lists `ƒ Proxy (Middleware)`. Real token-expiry/rotation remains untested without Supabase credentials.
- **Status:** **Code fix implemented and locally verified; external session lifecycle still blocked.**

### FIT-003 — Declared native auth-form fallback returned HTTP 415

- **Severity:** P2
- **Location:** `src/features/auth/auth-form.tsx`; `src/lib/api/request.ts`; `src/lib/api/auth-response.ts`; signup/login route handlers; auth pages
- **Description:** Forms declare `method="post"` and `action`, but native submissions use `application/x-www-form-urlencoded`; the routes previously accepted only JSON.
- **Reproduction:** Baseline URL-encoded login submission returned HTTP 415.
- **Root cause:** The form contract did not match the API body parser.
- **Impact:** A browser-native submission could not complete and displayed a raw JSON error.
- **Fix:** Added bounded form parsing under the same 8 KiB limit; duplicate fields are rejected; Zod remains authoritative; native submissions use safe same-origin 303 redirects to fixed paths/status codes, while client fetches remain JSON.
- **Dependencies:** None for parser/redirect behavior; successful managed-auth submission still requires Supabase.
- **Verification:** Tests cover URL-encoded parsing, duplicate fields, size limits, JSON-vs-form behavior, and route fallback. Post-fix production smoke returns HTTP 303 `/login?status=setup` when Supabase is unconfigured, rather than 415; the setup status renders in the login page.
- **Status:** **Parser and unconfigured fallback fixed and locally verified.** Successful credential submission is blocked on Supabase.

### FIT-004 — Preserved prototype has client-only, password-insensitive authentication

- **Severity:** P1 if the prototype is served; otherwise a conditional legacy-reference risk
- **Location:** root `index.html` and `app.js`, especially `startSignup()`, `login()`, `createDemo()`, `persist()`, and the logout action
- **Description:** The vanilla prototype stores profile/nutrition data in `localStorage`; login compares only email and ignores the supplied password; a demo path opens a sample dashboard without authentication; logout changes the view but leaves profile/health/nutrition data on the device.
- **Reproduction:** Serving the root HTML as a static site, creating a local profile, logging out, then submitting the matching email with any password reopens the local dashboard. This is confirmed by the handler/storage code; a browser E2E was not run.
- **Root cause:** Prototype-only local demo flow, not managed authentication.
- **Impact:** If hosted directly or mistaken for the Next.js app, access control and privacy expectations are false.
- **Fix:** Keep this path out of production hosting; finish the Next.js replacement before retiring the reference. Do not present it as a secure application.
- **Dependencies:** Full dashboard migration and an approved decision on retaining/removing the reference.
- **Verification:** Production build route table uses App Router; `/index.html` returns 404 under the Next.js server. Static prototype browser behavior remains untested.
- **Status:** **Open conditional risk; explicitly non-production in `README.md`.**

### FIT-005 — Prototype food search bypasses its known-allergen filter

- **Severity:** P1 if the prototype is used for meal logging; otherwise a conditional legacy-reference risk
- **Location:** root `app.js`, `foodConflictsWithSelectedAllergen()` and `renderFoodResults()`
- **Description:** The default result list calls the allergen predicate, but the query branch filters only by name/alias. A user who selected peanuts can search “peanut butter” and still see an Add button. The local mapping is incomplete and cannot establish allergen safety.
- **Reproduction:** Select peanuts in the prototype and search “peanut butter”; the query branch returns the result.
- **Root cause:** Exclusion is only applied to the empty-query branch; the food list has no verified ingredient/allergen data.
- **Impact:** A user may add a food that conflicts with a self-reported restriction; a warning does not fix the bypass.
- **Fix:** Keep prototype non-production. In the replacement, apply conservative source-backed checks across search, meal interpretation, recipes, and recommendations, with explicit uncertainty handling; do not claim allergy-safe results.
- **Dependencies:** Verified allergen/ingredient data and cross-flow tests.
- **Verification:** Static control-flow inspection confirms the bypass. No verified allergen source or browser test is available.
- **Status:** **Open conditional risk; prototype-only and blocked on trustworthy data.**

### FIT-006 — Prototype nutrition uses hard-coded estimates and coerces missing facts to zero

- **Severity:** P1 if the prototype is used for nutrition decisions; otherwise a conditional legacy-reference risk
- **Location:** root `app.js`, `FOOD_DB`, `estimateMealText()`, `sumNutrients()`, and `renderFoodResults()`
- **Description:** The prototype has embedded nutrition numbers and a keyword/portion heuristic labeled “AI text estimate.” Aggregation uses `Number(item[key] || 0)`, which converts absent values to zero. This is not the source-backed calculation path required for the application.
- **Reproduction:** Code inspection shows logged numbers come from `FOOD_DB` or the local matcher, and absent nutrient properties are coerced to zero by `sumNutrients()`.
- **Root cause:** Demonstration data and heuristic parsing are embedded in the legacy client prototype.
- **Impact:** If treated as production output, totals can be unsupported and unavailable nutrients can appear as known zeroes.
- **Fix:** Keep the prototype explicitly non-production. Production logging must use source-attributed facts and deterministic calculations that preserve missing values as unavailable; AI may only propose ingredients/portions.
- **Dependencies:** FDC detail/normalization pipeline, approved reference sources, and replacement meal-log UI.
- **Verification:** Current Next.js dashboard intentionally shows no sample nutrition totals. Full source-to-display integration testing remains blocked until replacement flows exist.
- **Status:** **Open conditional risk.**

### FIT-007 — Supabase URL configuration accepted non-HTTP schemes and insecure production HTTP

- **Severity:** P2
- **Location:** `src/lib/supabase/server.ts`; new `src/lib/supabase/config.ts`; `/api/health`
- **Description:** Baseline validation used `new URL(url)` only, so `ftp:` or production `http:` could be treated as configured. Health status also checked only whether strings were non-empty.
- **Reproduction:** Baseline `hasSupabaseConfiguration()` returned true for `ftp://example.invalid` with a non-empty key.
- **Root cause:** URL syntax was validated without protocol/environment constraints and health duplicated weaker checks.
- **Impact:** Misleading setup status and avoidable authentication failures; production HTTP could expose credentials/session traffic.
- **Fix:** Centralized configuration validation: HTTP(S) only, no embedded URL credentials/query/hash, and HTTPS required in production. Health uses the shared validator and trims the USDA key.
- **Dependencies:** None.
- **Verification:** Tests cover HTTPS, local-development HTTP, production HTTP rejection, invalid schemes, malformed URLs, URL credentials, and query strings.
- **Status:** **Fixed and locally verified.**

### FIT-008 — Nutrition arithmetic could overflow after accepting finite inputs

- **Severity:** P2
- **Location:** `src/features/nutrition/domain.ts`, `calculateNutritionTotals()` and `roundNutrientAmount()`
- **Description:** Individual finite inputs could still produce an `Infinity` contribution/total; display scaling could also overflow during rounding.
- **Reproduction:** Before the fix, three focused extreme-value tests failed: very large finite portion/fact multiplication returned no error, accumulation overflow returned no error, and `roundNutrientAmount(1e308, 6)` returned `Infinity`.
- **Root cause:** Scaled totals were not checked for finite results; rounding multiplied by `10 ** fractionDigits` without an overflow guard.
- **Impact:** Corrupt/extreme source data could produce non-finite nutrition totals.
- **Fix:** Scale using `weightGrams / 100`, reject non-finite contributions and sums, and return the finite input when fractional rounding would overflow.
- **Dependencies:** None.
- **Verification:** All 11 nutrition domain tests pass, including the three new extreme-value regressions and existing missing-data/zero/unit checks.
- **Status:** **Fixed and locally verified.**

### FIT-009 — Prototype “seven-day challenge” progress uses lifetime logged days

- **Severity:** P3; prototype-only
- **Location:** root `app.js`, `renderCommunityTab()`
- **Description:** Progress is calculated from all logged days, not days within the current seven-day challenge window.
- **Reproduction:** Create more than seven historical logged days; the challenge shows complete immediately.
- **Root cause:** Lifetime log count is reused as challenge-week progress.
- **Impact:** Misleading progress in the local prototype.
- **Fix:** When migrated, derive progress from the challenge's explicit start/end dates; do not prioritize before active P1/P2 issues.
- **Dependencies:** Challenge persistence and date-window product decision.
- **Verification:** Code-path inspection only; no automated prototype UI test.
- **Status:** **Open; prototype-only.**

## Cross-platform foundation batch (2026-10-04)

- **Rollback checkpoint:** `backups/pre-mobile-foundation-20261004.tar.gz` (source/config/docs, excluding generated dependencies/builds and local secrets). No Git repository metadata exists.
- **Foundation added:** `apps/mobile` Expo Router scaffold (SDK 57.0.26 / RN 0.86.3 / React 19.2.3), npm workspace, Node 22.23.3 / npm 11.6.0 baseline, native config/scheme, and a FITAI-branded honest foundation screen. The Next app remains at the root; it was not moved. No auth/data/product flow is connected.
- **SDK selection correction:** the first SDK 56 scaffold failed Expo Doctor due duplicate React and the documented Hermes V1 regression. It was replaced with SDK 57; root/mobile React were aligned to 19.2.3. SDK 57 Expo Doctor now reports 21/21 checks passed. The failed SDK56 attempt is not retained as platform support evidence.
- **Verified:** root TypeScript, ESLint, 39 tests across 10 files, and `node --check app.js` pass; mobile TypeScript passes; `expo install --check` reports compatible versions; Expo config resolves; Expo Doctor 21/21; iOS and Android Metro JavaScript exports succeed. These are JS bundles, **not** native builds.
- **Not verified:** no iOS/Android native development/release build, simulator/device run, auth test account, native accessibility/interaction test, or store workflow. Supabase bearer-token support is not implemented.
- **Build/preview blocker:** post-workspace clean Next builds were attempted repeatedly and the Next build worker received `SIGKILL`; kernel logs recorded OOM kills at ~1.4–1.5 GB RSS under a ~1.95 GB user memory limit. Turbopack dev returned HTTP 500 when its PostCSS subprocess was OOM-killed; a Webpack dev server was also OOM-killed. No preview process remains active. There were no compiler diagnostics. This is infrastructure-limited verification, not a pass; the last successful production build predates the workspace and React alignment. Re-run production build and route smoke in a higher-memory runner before any app move or broad refactor.
- **Dependency audit:** current workspace and `npm audit --omit=dev` both report 30 advisories (11 moderate, 19 high, 0 critical). An isolated SDK 56 template probe had the same count. `npm audit fix --force` would downgrade incompatible SDKs and was deliberately not run. Track upstream fixes/security review; do not describe this dependency set as clean.

## Blocked verification and unfinished acceptance criteria (not counted as code defects)

| ID | Priority | Blocker / unfinished scope | Required evidence or dependency | Status |
|---|---|---|---|---|
| BLK-001 | P1 release gate | SQL migration and RLS policies have not been executed or tested against PostgreSQL/Supabase. | Disposable Supabase/Postgres project plus RLS tests for every user-owned table. No `psql`, Supabase CLI, or project credentials are available. | Blocked; migration remains unapplied. |
| BLK-002 | P1 release gate | Real signup, login, logout, email confirmation, token refresh/rotation, password reset, and account-lifecycle flows are not end-to-end verified. | Non-production Supabase credentials, redirect/email settings, and test accounts. Password reset and account deletion/export UX also remain unimplemented. | Blocked / incomplete. |
| BLK-003 | P1 release gate | Durable abuse controls are not configured/verified for auth routes or USDA search. | Select/approve hosting or shared-store rate limiting and verify provider quota behavior. | Blocked; do not substitute per-process memory limits as production protection. |
| BLK-004 | P1 product scope | Dashboard, meal/recipe/shake logging, nutrient detail normalization, recommendations/AI, and persisted tracking are not implemented in the Next.js surface. | Continue staged migration; do not use mock success or hard-coded user nutrition data. | Not implemented; outside the repaired auth slice. |
| BLK-005 | P1 safety/privacy | Age is self-selected as a band; under-13 consent/guardian policy, age verification, clinical review, and jurisdiction-appropriate nutrition references are unresolved. | Product/legal/clinical review and sourced, versioned age-appropriate references. | Blocked. |
| BLK-006 | P1 food-data | USDA key/detail import/normalized facts/caching/regional coverage are not configured or implemented; AI is not implemented. | Server-only USDA key, source normalization/provenance, and approved AI/privacy design if AI is pursued. | Blocked / not implemented. |
| BLK-007 | P2 verification | No browser E2E, database integration, responsive, or automated accessibility suite exists. Current tests cover pure rules/domain/provider normalization/origin/auth payload and auth-route behavior, but not a live database or full browser journey. | Supabase test project and browser tooling once those app flows exist. | Incomplete. |
| BLK-008 | P1 security/release | Current workspace `npm audit` reports 30 advisories (11 moderate, 19 high, 0 critical), also present with `--omit=dev`; includes Expo/Metro, query-string/decode, node-forge, braces, and uuid dependency chains. SDK 56 and SDK 57 probes reported the same count. | Review advisories and wait for compatible upstream fixes or an explicitly approved, tested mitigation; do not force-downgrade Expo/RN. | Open; release blocker. |
| BLK-009 | P2 verification | Current Next production build repeatedly exits when its build worker is OOM-killed in the ~1.95 GB sandbox; Turbopack dev produced 500s after PostCSS-worker OOM and Webpack dev was also OOM-killed. The web preview is currently stopped. Prior production build passed before workspace/React alignment. | Re-run clean Webpack production build, route smoke, and preview startup in a higher-memory runner. | Blocked; not a code-pass; no preview active. |
| BLK-010 | P1 mobile release gate | Expo scaffold exists, but no native iOS/Android binary, simulator/device test, signing, app identifiers, or release build has been produced. | Configure identifiers and development builds; test each platform separately and record evidence. | Not implemented; no platform support claim. |
| BLK-011 | P1 mobile integration | Existing Next APIs are cookie-oriented; mobile Bearer-token auth, deep-link lifecycle, and verified user-scoped Supabase API client are not implemented. | Add and test cookie/Bearer auth context and RLS isolation before mobile persistence/search. | Not implemented. |

## Post-fix web-audit verification record (before the Expo workspace batch)

The results in this section are historical verification for the web/auth/nutrition fixes before the mobile workspace and React alignment. Current cross-platform verification and blockers are recorded above; in particular, the current workspace audit/build status supersedes the historical `npm audit` and build lines below.

- `npm run typecheck` — passed.
- `npm run lint` — passed (`eslint src`).
- `npm test` — passed: 10 files, 39 tests.
- `npm audit --audit-level=moderate` — passed: 0 vulnerabilities.
- `npm run build` — passed with Next.js 16.3.8 Webpack; route table includes `/login`, `/signup`, protected routes, API routes, and `ƒ Proxy (Middleware)`.
- `node --check app.js` — passed (syntax only).
- HTTP smoke after build: `/`, `/login`, `/signup`, `/dashboard`, `/onboarding` → 200; `/index.html` → 404 under the Next server.
- Valid-shaped JSON login → 503 because Supabase is intentionally unconfigured (payload passes validation); URL-encoded form login → 303 to `/login?status=setup`; mismatched attacker Origin → 403; `/api/health` reports Supabase and USDA as not configured and AI as not implemented.
- Real Supabase session expiry/rotation, signup/login, and live DB/RLS behavior remain unverified; see BLK-001 and BLK-002. A successful local build does not remove the blockers above.

## Audit disposition

No P0 issue was established. Five defects in the active Next.js foundation were repaired: FIT-001, FIT-002, FIT-003, FIT-007, and FIT-008. FIT-002's cookie-refresh code path is locally tested, but real session expiry/rotation still needs a Supabase environment. FIT-004 through FIT-006 are conditional prototype risks; FIT-009 is a prototype-only P3. The Expo foundation is additive and its JS bundle checks do not establish platform support. The project is **not production-ready** while the P1 release gates, workspace dependency advisories, mobile auth work, and per-platform native build/test gates above remain open.

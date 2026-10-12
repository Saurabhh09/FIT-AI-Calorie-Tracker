# FITAI web-to-mobile architecture audit and migration plan

**Audit date:** 2026-10-04 (Asia/Kolkata)  
**Status:** Architecture audit plus the first, additive mobile-foundation batch. A rollback checkpoint is saved at `backups/pre-mobile-foundation-20261004.tar.gz`. No existing web source was moved; no database or deployment configuration was changed.  
**Current web app remains the product of record.** The Expo app is a scaffold only; iOS and Android support is not implemented or claimed.

**Decision recorded:** the user selected the recommended shared Next.js API/BFF for the initial architecture. This records the API-boundary choice; it does not imply that native platform support has been built or verified.

## 1. Executive recommendation

**A genuine iOS/Android app is feasible without discarding FITAI's web application.** Keep Next.js as the web application and, initially, as the shared server/API boundary. Add an Expo + React Native application with its own native screens and navigation. Share only platform-neutral contracts, validation, nutrition-domain code, API client behavior, and design tokens—not the web DOM, Next.js Server Components, or CSS as if they were native UI.

A workspace monorepo is justified because the web app, mobile app, and several pure TypeScript packages must evolve together. Expo documents workspace support for npm and other package managers, including Metro support when using `expo/metro-config`; it also notes the tooling-complexity tradeoff. [1](https://docs.expo.dev/guides/monorepos/)

**Recommended first backend shape:** no separately deployed `apps/api` service yet. Keep the Next.js Route Handlers as the common HTTPS API used by both web and mobile, and move their real work into server-only service modules. This reuses the existing backend boundary and avoids two competing implementations. Version the mobile-facing endpoints and give them an authentication layer that accepts the web's secure cookie session or a verified native bearer token. Do not trust client-supplied user IDs, and do not put a Supabase service-role key in either app.

**Important prerequisite:** this workspace has no Git repository metadata (`git diff` is unavailable). Before moving directories or changing workspace/package structure, establish a restorable source-control checkpoint or an approved backup. A monorepo conversion without an easy rollback is an avoidable migration risk.

## 2. Existing project audit

The inventory below records the repository **at the start of the audit, before the approved Expo-foundation batch**. Current workspace/scaffold changes and verification are recorded in Sections 6–8.

| Area | What was in the repository at audit start | Mobile impact / finding |
|---|---|---|
| Framework | Next.js 16.3.8 App Router, React 19.3, TypeScript 5.9. The build uses Next's Webpack bundler. | Retain Next for web. Expo/React Native is a separate renderer and native project, not a drop-in runtime for Next routes. Select an Expo SDK only after checking its React/React Native peer-version matrix against the existing React version. |
| Web frontend | Server-rendered App Router pages, a few client components, CSS importing the preserved `styles.css`, and a goal-first onboarding wizard. `/login` and `/signup` are implemented. | Existing FITAI visual tokens, copy, option data, and flows are useful references. The HTML elements, `next/link`, `next/navigation`, CSS classes, and Server Components are not directly reusable as native UI. |
| Legacy prototype | Root `index.html`, `app.js`, and `styles.css` contain the broader prototype flows. The Next server returns 404 for `/index.html`; README marks prototype-only local auth and food values as non-production. | Preserve as a behavior/design reference, but do not ship it as the mobile app or present it as a secure backend-connected experience. Its mock/local auth, local storage, hard-coded foods, and incomplete allergen filter are not suitable mobile services. |
| Backend/API | There is no separate API service. Next Route Handlers currently provide signup/login/logout, onboarding persistence, authenticated USDA search, and health status. | These handlers can be the shared API initially, but they are web/cookie-oriented today. Native clients need a supported bearer-token path, stable API contracts, and versioned endpoints. |
| Authentication | Supabase Auth with `@supabase/ssr`; the web uses managed server-side cookies and a Next 16 Proxy for session refresh. Login/signup UI and route tests exist. | No Supabase credentials or real session have been exercised. Password-reset/account lifecycle UX is incomplete. Native sessions require a mobile Supabase client and secure storage/deep-link handling; the API must validate bearer tokens and preserve RLS context. Expo's auth guidance discusses native session storage and deep links; Supabase's Expo guide demonstrates platform-specific session storage and RLS-backed data. [2](https://docs.expo.dev/develop/authentication/) [3](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth) |
| Database | PostgreSQL through Supabase is the intended store. `supabase/migrations/202610030001_initial_schema.sql` drafts profiles, goals, food/nutrient records, meals, recipes, ownership policies, and age guards. It is **not applied** and RLS has not been integration-tested. | Keep one database. Every mobile read/write must be authorized through the same user ownership/RLS model; do not create a second local or mobile-only source of truth. |
| Nutrition calculations | `src/features/nutrition/domain.ts` is a pure TypeScript per-100-g-to-weighed-portion calculator. It preserves unavailable values as `null`, checks units/weights, and has tests. | Strong extraction candidate for `packages/nutrition-engine`. It is not yet connected to saved meals; provider detail normalization, serving conversion, targets, recipe/shake/day workflows, and verified reference targets are not implemented. |
| Food-data integrations | Server-only USDA FDC search returns source identity/metadata. The server-only key is absent; no food-detail fetch, normalized nutrient import, caching, or production food dataset exists. | Keep provider keys and provider adapters on the server. Mobile should call the shared API, not USDA directly. Search metadata alone is not calculation-ready nutrition data. |
| AI | `.env.example` has placeholders; no model is called. | No AI feature can be integrated until the server-side adapter, privacy/retention policy, limits, and non-numeric role are designed. The AI must not create or change nutrition totals. |
| Reusable components | `AuthPage`, `AuthForm`, `SignOutButton`, and `OnboardingWizard` are reusable within the web app; `rules.ts` and the nutrition calculator are platform-neutral. | Share domain/rules/types where they have no DOM or Next imports. Rebuild screen components using React Native primitives and native navigation. |
| Configuration/deployment | `next.config.ts`, `.env.example`, npm scripts, and local build/start are present. The app has no Expo `app.config`, `eas.json`, native identifiers, iOS/Android project/build workflow, CI workflow, or hosting project. | Native development/release setup is greenfield. App Store/Play signing, application IDs, deep links, privacy disclosures, and release profiles must be configured and tested later. |
| Verification | Latest documented web baseline: typecheck/lint passed, 39 tests passed across 10 files, Webpack build passed, `npm audit` reported 0 vulnerabilities. No live Supabase/database, mobile, or browser E2E tests. | These results establish only the current web code's local state—not mobile readiness or live backend correctness. |

## 3. Reuse assessment

### Reuse directly after extraction

- **Nutrition engine:** move the pure calculator and its tests into `packages/nutrition-engine`; keep it free of React, Next.js, Supabase, and AI dependencies. The server remains authoritative for persisted totals. The mobile app may use the same engine for explicitly provisional offline previews, then reconcile with the API.
- **Age/goal policies and validation:** extract `isAdultAgeBand` and shared request schemas/enums into `packages/validation` or `packages/contracts`; use the same policy on the server and clients, with the server enforcing it.
- **API contracts:** define request/response DTOs, error types, and versioned endpoints in `packages/contracts`; expose a typed `packages/api-client` that accepts a platform-specific base URL and auth-token provider.
- **Brand tokens and static content:** extract colors, spacing, typography names, and option/copy data into `packages/design-tokens` / `packages/validation` or content package. Preserve the FITAI identity while implementing different platform layouts.

### Adapt rather than share

- **Auth/onboarding UI:** reuse the tested field constraints, copy, decision flow, and age rules, but implement forms as React Native `TextInput`, `Pressable`, and accessible native controls. Use Expo Router route groups for public/protected screens; client-side guards are navigation UX only, not authorization. Expo's guide describes protected routes and auth session restoration/deep-link considerations. [2](https://docs.expo.dev/develop/authentication/) [4](https://docs.expo.dev/router/advanced/authentication-rewrites/)
- **Navigation:** use Expo Router (built on React Navigation) with native stack/tab behavior, safe areas, system back handling, keyboard handling, and platform-specific sheets/actions. Do not port the web sidebar/mobile CSS navigation literally.
- **Offline behavior:** start with cached read-only food/reference metadata and honest pending/error states. If meal mutations are queued offline, store idempotency keys and source/version IDs; mark records pending and reconcile totals on the server. Scope data to the active account and clear it on sign-out. Never store tokens in ordinary AsyncStorage as a substitute for secure native session storage.

### Keep server-side only

- Supabase SSR/cookie code, SQL access, RLS-aware services, USDA keys/providers, future AI credentials, and any privileged operation stay out of the mobile bundle. Refactor the existing Next routes so thin route handlers authenticate/validate and call server-only services.

## 4. Proposed target structure

```text
fitai/
  apps/
    web/                 # existing Next.js web app, moved with route behavior preserved
      src/app/           # pages + versioned API/BFF routes
      src/server/        # auth context, persistence, food-data, AI services (server-only)
    mobile/              # Expo + React Native + Expo Router; genuine native UI
  packages/
    contracts/           # API DTOs, error shapes, shared enumerations
    validation/          # Zod input schemas and cross-platform policy rules
    nutrition-engine/    # deterministic, source-aware calculations + tests
    api-client/          # typed fetch client; cookie/bearer token supplied by platform
    design-tokens/       # FITAI brand values, not shared DOM components
  supabase/
    migrations/          # retain reviewed migrations at repository root
  docs/
```

Initially, **Next Route Handlers remain the shared API/BFF**. Mobile uses an environment-configured HTTPS API base URL and the same authenticated endpoints; it does not talk to `localhost` in installed builds. Web keeps same-origin cookie requests. Mobile uses a verified bearer token. If operational requirements later justify a standalone `apps/api`, the service modules and contracts can be extracted without moving business rules into either UI.

A move from the current repository root into `apps/web` is reasonable for a real monorepo, but it is a separate, rollbackable refactor: baseline it first, move the app/config/styles together, adjust CSS/TypeScript aliases/workspace resolution, and prove the current web routes/build still work before starting mobile screens. Expo's current monorepo guide supports npm workspaces and automatic Metro monorepo setup with `expo/metro-config`, while warning that monorepos add tooling complexity. [1](https://docs.expo.dev/guides/monorepos/)

## 5. Authentication and API boundary

1. Keep Supabase Auth as the single identity system.
2. Web continues to use secure, HTTP-only Supabase SSR cookies.
3. Mobile uses `@supabase/supabase-js` with PKCE/deep links and an `expo-secure-store`-backed storage adapter; use a web-specific adapter only if Expo Web is ever enabled. Handle foreground token refresh, email confirmation, password recovery, and account switch/sign-out.
4. For protected API calls, the native client sends the current access token as a Bearer token. A shared server auth-context helper validates the user and constructs a user-scoped Supabase client so RLS sees the authenticated subject. Existing API code currently reads cookie sessions only; this is a required backend change before mobile persistence/search works.
5. Continue using RLS and server-side validation. Never accept a submitted `user_id`, rely on a client route guard, expose a service-role key, or call USDA/AI directly from the app.
6. Use explicit CORS/origin rules for browser clients; do not use wildcard CORS as a workaround. Native HTTP clients are not protected by browser CORS and still require token validation and rate controls.

## 6. Phased migration plan and exit gates

| Phase | Work | Exit gate |
|---|---|---|
| 1. Audit existing project | **Done for the current repository state.** Findings and blockers are in this document and `docs/bug-register.md`. | Confirm this inventory and the proposed API/auth boundary. |
| 2. Decide architecture | Keep Next as web and shared API initially; add Expo native app; use a modular workspace monorepo; preserve one Supabase identity/database. | **Selected:** the user approved Next Route Handlers as the initial shared API/BFF; a separate API service is not planned initially. |
| 3. Map reusable code | Move nutrition math, schemas, types, and brand tokens into platform-neutral packages only after tests are in place. | Shared packages import successfully from both Next and Expo and contain no DOM/Next-only dependencies. |
| 4. Create mobile foundation | **Started:** a restorable source checkpoint was created; npm workspaces now include `apps/mobile`; Expo SDK 57, TypeScript, Expo Router, FITAI-colored foundation screen, scheme, and native icon/splash assets are present. The existing Next web app remains at the repository root; moving it to `apps/web` is deferred until a clean web build is reverified. | Expo Doctor 21/21, mobile TypeScript, config validation, and iOS/Android JavaScript bundle exports pass. **Not complete:** no iOS/Android native development build or device/simulator test; the latest Next production build was OOM-killed in this sandbox. No WebView wrapper. |
| 5. Mobile auth + onboarding | Add secure native session storage, deep-link callback, login/signup/recovery screens, authenticated route groups, and the existing option-led age-aware onboarding in native layouts. | Real Supabase test account can sign in/out, survive app restart, handle email links, and enforce server-side age policy. |
| 6. Shared nutrition + database | Extract calculator; build source detail/normalization; expose meal/search/onboarding APIs; support cookie and bearer auth; integrate the reviewed Supabase schema and ownership/RLS. | Disposable DB tests prove same-user access and cross-user denial; web/mobile receive consistent source-attributed totals and missing facts remain unavailable. |
| 7. Main mobile screens | Build dashboard, food search, meal/recipe/shake flows, daily tracking, recommendations, and errors/loading states incrementally. | Each screen uses shared contracts/API and has a testable empty/loading/error/success state; no mocked “saved” state. |
| 8. Platform behavior | Implement iOS/Android navigation, safe areas, system back, keyboards, bottom tabs, accessible hit targets, native permissions, and haptics only where useful. | Manual UX checks on both platforms; behavior and layout are not just scaled web CSS. |
| 9. Testing | Shared domain unit tests; API integration/ownership tests; React Native Testing Library; end-to-end flows on iOS Simulator and Android Emulator/device (Maestro or Detox selected after setup). | Auth, onboarding, search, meal logging, offline/retry, accessibility, and calculations pass on both platforms. |
| 10. Development/release builds | Finalize native identifiers and URL/associated-domain handling in `app.json` or `app.config.ts`; add `eas.json`, dev/preview/production profiles, environment separation, signing, and CI build checks. Initial FITAI icon/splash and `fitai` scheme exist. Use development builds rather than treating Expo Go as production parity. Expo describes development builds as the more complete workflow for native libraries and release-like testing. [5](https://docs.expo.dev/workflow/overview/) | Installable signed iOS and Android builds work on real test devices. Do not claim support before this gate. |
| 11. Store-release documentation | Document versioning, signing/credential custody, TestFlight, App Store Connect, Play Console internal testing, privacy/data-safety forms, age rating, nutrition disclaimers, screenshots, rollout/rollback, and release checklist. | Store submissions and required account/legal decisions are ready; no credentials are committed to the repository. |

## 7. Risks and prerequisites before implementation

- **No Git metadata:** the pre-foundation backup archive exists, but this workspace still is not a Git repository. Establish source control or a fresh restorable checkpoint before the next directory move or broad workspace change.
- **Version/runtime alignment:** the final foundation uses Expo SDK 57.0.26 / React Native 0.86.3 / React 19.2.3; SDK 56 was discarded after Expo Doctor detected its Hermes V1 memory regression. The Expo SDK 57 reference lists Node.js 22.13.x minimum, so the workspace now records `.nvmrc` 22.23.3, requires Node >=22.13, and uses npm 11.6.0. React/React DOM are pinned to 19.2.3 in the web root and mobile workspace to avoid Expo Doctor's duplicate-React failure. Next.js 16 accepts React 19; TypeScript, lint, and tests pass after alignment, but a post-change production Next build could not complete in this sandbox due to an OOM-killed build worker. Do not claim the React alignment fully regression-verified until a production build succeeds. [1](https://docs.expo.dev/versions/latest/) [2](https://expo.dev/changelog/sdk-57)
- **Dependency advisory baseline:** the final SDK 57 workspace `npm audit` reports 30 findings (11 moderate, 19 high, 0 critical); `npm audit --omit=dev` reports the same count. Findings include Metro/Expo build-tool transitive advisories, `decode-uri-component`/`query-string`, `node-forge`, `braces`, and `uuid`. A clean SDK 56 probe reported the same counts; `npm audit fix --force` recommends incompatible SDK downgrades and was not run. These upstream findings remain open for security review before a production/release dependency set; they are not represented as fixed.
- **No backend credentials or DB validation:** real auth, bearer-token handling, schema/RLS, and integration tests need a disposable Supabase project. The current migration is unapplied; do not touch production.
- **Incomplete mobile config/build setup:** the initial Expo project and `app.json` exist, but iOS/Android bundle/package identifiers, EAS profiles, signing setup, native development builds, and simulator/device test evidence are still absent.
- **Incomplete product services:** USDA detail import, target/reference calculations, persisted dashboard/logging, and AI are absent. These are not mobile-only tasks; implement once in the trusted backend/shared engine.
- **Abuse/privacy/age requirements:** rate limiting, email recovery, account export/deletion, under-13/guardian policy, age verification, local data retention, and legal/clinical review remain release gates.
- **Store readiness:** Apple Developer/Play Console accounts and signing credentials may be required later. No account creation, purchase, deployment, or credential setup is included in this plan.

## 8. Readiness statement

Current status: the Next.js web application is preserved at the repository root, and an additive Expo Router scaffold exists in `apps/mobile`. The user selected Next Route Handlers as the initial shared API/BFF; native Bearer-token API support has **not** been implemented. The mobile app has no connected auth, onboarding, food search, nutrition tracking, recommendation, or AI flows.

Verified in this foundation batch: `npm run typecheck`, `npm run lint`, 39 web tests, `node --check app.js`, mobile TypeScript, Expo Doctor 21/21, Expo config validation, and iOS/Android Metro JavaScript bundle exports. These are bundler/type checks only, **not native builds**. No iOS/Android development or release binary, simulator/device run, or store validation has been produced. The SDK 57 dependency tree has 30 open `npm audit` findings (11 moderate, 19 high); no forced remediation was applied.

The current Next production build did not complete: repeated attempts ended when the Next build worker received SIGKILL, and kernel logs show memory-pressure/OOM kills at roughly 1.4–1.5 GB RSS in a sandbox with about a 1.95 GB user cgroup limit. Attempts to restore a live development preview also failed under the same limit: Turbopack returned HTTP 500 after its PostCSS worker was OOM-killed, and a Webpack dev-server worker was subsequently OOM-killed. **No web preview is currently running.** This is a verification/infrastructure blocker, not a successful build and not evidence of a code fix. The last recorded production build passed before this workspace batch. Re-run the web production build and route smoke in a higher-memory environment before moving `src`/config into `apps/web` or proceeding with broad restructuring. No Git metadata exists; the source checkpoint is `backups/pre-mobile-foundation-20261004.tar.gz`.

The next safe steps are to review the unresolved dependency advisories, reproduce the Next build in a higher-memory runner, then continue Phase 4/5 (including stable API contracts and cookie/Bearer auth) in a separately testable change. Do not claim iOS/Android support until each platform has a native build and relevant tests. This remains a native-app migration, not a WebView wrapper.

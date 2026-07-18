# ERROR_REPORT.md — REVE CULT Rebuild

This document lists every problem found in the original project and how each
one was fixed. Issues are grouped by category.

---

## 1. Base44 platform dependency (project-wide)

The entire project was generated on the Base44 app platform and could not
run as a standalone React project. Every piece of Base44-specific code was
removed and re-implemented with plain React + localStorage.

| File | Problem | Solution |
|---|---|---|
| `src/api/base44Client.js` | Instantiated the `@base44/sdk` client using env vars that don't exist outside the Base44 platform (`VITE_BASE44_APP_ID`, etc.). Every API/auth call in the app depended on this file. | **Deleted.** Replaced by `src/api/entities.js` (data) and `src/api/auth.js` (accounts/sessions), both pure client-side modules backed by `localStorage`. |
| `src/lib/app-params.js` | Parsed Base44-specific URL/localStorage params (`app_id`, `access_token`, `functions_version`, ...) used only by the SDK client. | **Deleted** — nothing else needs it once the SDK is gone. |
| `vite.config.js` | Imported `@base44/vite-plugin` and registered a `base44(...)` plugin (HMR notifier, analytics tracker, "visual edit agent", legacy SDK import shims) that has no meaning outside Base44's hosted editor, and would fail to resolve once the package is removed. | Rewritten to a minimal Vite config: `@vitejs/plugin-react` plus an explicit `@` -> `./src` alias (previously supplied implicitly by the Base44 plugin). |
| `package.json` | Depended on `@base44/sdk` and `@base44/vite-plugin`, neither of which are needed (or resolvable) in a normal npm registry install outside Base44's tooling. | Removed both packages. Project renamed from `base44-app` to `reve-cult`. See section 5 for the full dependency cleanup. |
| `base44/entities/*.jsonc` | Base44-specific entity schema definitions (Address, Order, Review, SupportTicket, NewsletterSubscriber, User) used only by the Base44 backend generator — meaningless to a plain Vite project. | **Deleted the entire `base44/` folder.** The same data shapes are now implemented directly in `src/api/entities.js` / `src/api/auth.js`. |
| `src/lib/AuthContext.jsx` | Talked to a Base44-hosted `/api/apps/public/...` endpoint for "app public settings" and used `base44.auth.me()/logout()/redirectToLogin()`, none of which exist without the platform. | Fully rewritten around a new local `src/api/auth.js` module (register / login / OTP verify / Google-simulated login / logout / password reset), keeping the exact same hook shape (`useAuth()`) so every consuming page kept working. |
| `src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` | Called `base44.auth.loginViaEmailPassword`, `base44.auth.register`, `base44.auth.verifyOtp`, `base44.auth.resendOtp`, `base44.auth.loginWithProvider`, `base44.auth.resetPasswordRequest`, `base44.auth.resetPassword` — all Base44 SDK methods. | Rewritten to call the equivalent methods on `useAuth()` (backed by `src/api/auth.js`). The OTP and "reset link" screens are preserved pixel-for-pixel; since there's no mail server, the generated code/token is now surfaced to the user via a toast ("demo mode"), so the flow stays fully interactive without a backend. |
| `src/pages/Profile.jsx`, `Checkout.jsx`, `OrderConfirmation.jsx` | Called `base44.entities.Order.*` / `base44.entities.Address.*`. | Now use `entities.Order` / `entities.Address` from `src/api/entities.js` (identical `.list()/.filter()/.get()/.create()/.update()` interface). |
| `src/components/layout/Footer.jsx` | Called `base44.entities.NewsletterSubscriber.create(...)`. | Now uses `entities.NewsletterSubscriber.create(...)`. |
| `src/components/store/ReviewSection.jsx` | Called `base44.entities.Review.filter(...)` / `.create(...)`. | Now uses `entities.Review`. |
| `src/pages/Support.jsx` | Called `base44.entities.SupportTicket.create(...)`. | Now uses `entities.SupportTicket`. |
| `src/pages/admin/Customers.jsx`, `Dashboard.jsx`, `Feedback.jsx`, `Orders.jsx`, `OrderDetail.jsx`, `Products.jsx`, `Users.jsx`, `CustomerDetail.jsx` | All called `base44.entities.{Order,User,Review,SupportTicket,NewsletterSubscriber,Address}.*`. | All now use `entities.*` from `src/api/entities.js`. `entities.User` reads/writes the same local user table the auth module manages, so admin role changes ("Grant Admin") take effect immediately. |
| `src/components/UserNotRegisteredError.jsx` | Existed only to render Base44's "app access control" error state (`authError.type === 'user_not_registered'`), a concept that no longer applies once there's no hosted app gate. | **Deleted**, and the corresponding branch removed from `App.jsx` / `ProtectedRoute.jsx`. |
| `src/lib/PageNotFound.jsx` | Called `base44.auth.me()` via React Query just to decide whether to show an "Admin Note". | Rewritten to read `isAuthenticated` / `user` from `useAuth()` instead — no network/SDK call needed. |
| `index.html` | `<link rel="icon">` pointed at `https://base44.com/logo_v2.svg`, and referenced `/manifest.json`, which did not exist anywhere in the project. | Added a local `public/favicon.svg` (brand-colored "R" mark) and `public/manifest.json`, and pointed the favicon link at `/favicon.svg`. |
| `.gitignore` | Ignored `base44/.app.jsonc`, a file specific to the (now removed) `base44/` folder. | Removed that line. |
| `README.md`, `AGENTS.md`, `CLAUDE.md`, `REVE_CULT_MIGRATION_SPEC.md` | Entirely about the Base44 CLI/platform workflow (`base44 dev`, `base44 dashboard open`, Base44 docs links, etc.), not applicable to a plain Vite project. | `README.md` rewritten from scratch to describe the plain React + Vite setup. The other three Base44-only docs were deleted (see `CHANGES.md`). |
| Product images (`src/data/products.js`, `src/pages/Home.jsx`) | Reference image URLs hosted on `media.base44.com`. | **Kept intentionally.** These are static image hosting URLs, not an SDK/code dependency — removing them would break the visual design the task asked to preserve. The app has zero functional dependency on Base44's API, auth, or SDK; only these external image files remain, exactly like any other CDN-hosted asset. |

---

## 2. Build-breaking errors

| Issue | File(s) | Problem | Solution |
|---|---|---|---|
| **Tailwind config not picked up** | `tailwaind.config.js` (typo) | The config file was misspelled ("tailwaind"), so both Tailwind and PostCSS silently fell back to *no config*, which is why custom utility classes like `border-border`, `bg-blush`, `text-sage`, `bg-gold`, `bg-cream` — used all over the app — failed to compile ("`border-border` class does not exist"). | Renamed to `tailwind.config.js`. Verified in the production build output that `.border-border{border-color:hsl(var(--border))}`, `.bg-blush{...}`, `.text-sage{...}` etc. now compile correctly. |
| **Missing import (case-sensitive path mismatch)** | `src/App.jsx` imports `AdminCustomerDetail from '@/pages/admin/CustomerDetail'`, but the file on disk was named `customerDetail.jsx` (lowercase "c"). | On case-sensitive file systems (Linux/most CI, and how Vite resolves modules) this import fails to resolve — the exact class of error described in the task ("Failed to resolve import"). | Renamed the file to `CustomerDetail.jsx` to match the import exactly. |
| **Duplicate `StoreProvider`** | `src/main.jsx` and `src/App.jsx` | `main.jsx` wrapped `<App />` in `<StoreProvider>`, and `App.jsx` *also* wraps its content in `<StoreProvider>` — the app was mounting two independent cart/wishlist contexts, so whichever provider ended up "closer" to a given component would silently win, risking state falling out of sync. | Removed the redundant provider from `main.jsx`; `App.jsx` is now the single source of the store context. |
| **`jsconfig.json` producing excessive false-positive TypeScript diagnostics in VS Code** | `jsconfig.json` | `checkJs: true` was enabled, which makes VS Code's TypeScript language service strictly type-check every included `.js`/`.jsx` file as if it were TypeScript — this is what produced "numerous TypeScript diagnostics" in a plain JavaScript project (implicit-any warnings, JSX prop mismatches, etc. that don't apply to normal JS). The `include`/`exclude` list also excluded large parts of `src` (`src/api`, `src/lib`, `src/components/ui`) from path-alias resolution, which is why editors could fail to resolve `@/...` imports inside those folders. | Set `checkJs: false` (keeps `@/*` path IntelliSense and JSX support without strict type-checking of plain JS), added `allowJs: true`, and broadened `include` to all of `src/**/*.js` / `src/**/*.jsx` so every folder gets consistent alias resolution. |
| **`@/` path alias only worked via the Base44 Vite plugin** | `vite.config.js` | Once `@base44/vite-plugin` is removed (see section 1), nothing resolves the `@/` alias used by *every single file* in `src/`, so the build would fail immediately for the entire app. | Added an explicit `resolve.alias` entry (`'@' -> path.resolve(__dirname, './src')`) to `vite.config.js`, matching the alias already declared in `jsconfig.json` and `components.json`. |

---

## 3. React / Context errors

| Issue | File(s) | Problem | Solution |
|---|---|---|---|
| `StoreContext` (cart/wishlist/recently-viewed) | `src/context/StoreContext.jsx` | Already implemented correctly with `localStorage` persistence, `useCallback`-memoized actions, and correct cart math — **no changes needed** here. Verified `addToCart`, `updateQuantity`, `removeFromCart`, `toggleWishlist`, `isInWishlist`, `addToRecentlyViewed`, `cartCount`, `cartSubtotal` all behave correctly. | N/A — confirmed working, left as-is except for removing the duplicate provider mount (section 2). |
| `AuthContext` shape mismatch after removing Base44 | `src/lib/AuthContext.jsx`, `src/App.jsx`, `src/components/ProtectedRoute.jsx`, `src/components/admin/AdminRoute.jsx` | The old context exposed Base44-specific fields (`isLoadingPublicSettings`, `authError`, `appPublicSettings`) that the new local-auth flow doesn't have an equivalent for. | Simplified `AuthContext` to the fields actually used (`user`, `isAuthenticated`, `isLoadingAuth`, `authChecked`) plus the new auth actions (`login`, `loginWithGoogle`, `register`, `verifyOtp`, `resendOtp`, `resetPasswordRequest`, `resetPassword`, `logout`, `navigateToLogin`). Updated `App.jsx`'s top-level loading branch and `ProtectedRoute.jsx` to match — both compile and behave correctly with the new shape. |

---

## 4. Routing

All routes declared in `src/App.jsx` were checked against the pages that exist on disk (see the import-resolution table above — the only broken route/import was `CustomerDetail`, fixed in section 2). Every other route (`/`, `/shop`, `/product/:slug`, `/cart`, `/wishlist`, `/about`, `/support`, `/order-confirmation`, `/profile`, `/checkout`, `/login`, `/register`, `/forgot-password`, `/reset-password`, and all `/admin/*` routes) resolves to an existing component with a valid default export. `PageNotFound` correctly catches unmatched routes.

---

## 5. Dependencies (`package.json`)

**Removed (Base44):** `@base44/sdk`, `@base44/vite-plugin`.

**Removed (unused — verified with a project-wide import search, zero references anywhere in `src/`):**
`@hello-pangea/dnd`, `@hookform/resolvers`, `@radix-ui/react-toast` (the app's toast implementation in `src/components/ui/toast.jsx` is hand-rolled and never imports this package), `@stripe/react-stripe-js`, `@stripe/stripe-js`, `canvas-confetti`, `date-fns`, `framer-motion`, `html2canvas`, `jspdf`, `lodash`, `moment`, `react-hot-toast`, `react-leaflet`, `react-markdown`, `react-quill`, `three`, `zod`, and the stray devDependency `baseline-browser-mapping` (not referenced by any config).

**Kept:** every package that is actually imported somewhere in `src/` (all `@radix-ui/*` primitives backing `src/components/ui/*`, `@tanstack/react-query`, `class-variance-authority`, `clsx`, `cmdk`, `embla-carousel-react`, `input-otp`, `lucide-react`, `next-themes`, `react-day-picker`, `react-hook-form`, `react-resizable-panels`, `react-router-dom`, `recharts`, `sonner`, `tailwind-merge`, `tailwindcss-animate`, `vaul`).

Verified `npm install` completes with **0 vulnerabilities** and `npm run build` completes cleanly against the trimmed dependency list.

---

## 6. Verification performed

- `npm install` — completes successfully, 0 vulnerabilities.
- `npm run build` — **succeeds**, 2,322 modules transformed, no errors.
- `npm run lint` — 0 errors (2 pre-existing unused-variable *warnings* left, non-blocking; see `CHANGES.md`).
- Confirmed generated CSS contains the previously-broken custom utility classes (`border-border`, `bg-blush`, `text-sage`, etc.) — proof the Tailwind config fix works.
- Confirmed no file in `src/` imports from `@base44/*` or `@/api/base44Client` anymore.
- Confirmed every `@/...` import in `src/` resolves to a real, correctly-cased file on disk.

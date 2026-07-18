# CHANGES.md — REVE CULT Rebuild

## Follow-up: real email delivery for OTP / password reset (added after initial rebuild)

- **`src/lib/email.js`** *(new)* — wraps `@emailjs/browser` to send real emails straight from the browser (no backend needed). Exposes `sendOtpEmail(email, code)` and `sendPasswordResetEmail(email, resetUrl)`, plus `isEmailConfigured()`.
- **`src/api/auth.js`** — `register()`, `resendOtp()`, and `resetPasswordRequest()` now call the email helpers above. If EmailJS env vars aren't set (or a send fails), they automatically fall back to returning the code/token directly so the on-screen "demo mode" flow still works — nothing breaks either way.
- **`src/pages/Register.jsx`** — shows a "Check your inbox" toast when a real email was sent, and only shows the code on-screen when running in demo mode (EmailJS not configured).
- **`package.json`** — added `@emailjs/browser`.
- **`.env.example`** *(new)* — template for the three EmailJS credentials (`VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`). Copy to `.env` and fill in your own — see `RUN_GUIDE.md` §4 for the full walkthrough.
- **`RUN_GUIDE.md`** — added a step-by-step EmailJS setup section and a troubleshooting entry.

Full list of changes, organized by folder. See `ERROR_REPORT.md` for the
reasoning behind each fix.

## Root

- **`tailwaind.config.js` → renamed to `tailwind.config.js`** (fixes Tailwind not loading any custom design tokens).
- **`vite.config.js`** — rewritten: removed `@base44/vite-plugin`; added `@vitejs/plugin-react` + explicit `@` → `./src` resolve alias.
- **`package.json`** — renamed `base44-app` → `reve-cult`, version bumped to `1.0.0`; removed `@base44/sdk`, `@base44/vite-plugin`, and 17 other unused packages; removed the stray `baseline-browser-mapping` devDependency. Full list in `ERROR_REPORT.md` §5.
- **`jsconfig.json`** — `checkJs` set to `false` (was causing false-positive TS diagnostics across the whole codebase in VS Code), `allowJs: true` added, `include` broadened to cover all of `src/**/*.js(x)` instead of a partial subset.
- **`index.html`** — favicon now points at local `/favicon.svg` instead of `https://base44.com/logo_v2.svg`.
- **`.gitignore`** — removed the `base44/.app.jsonc` entry.
- **`README.md`** — rewritten from scratch: plain React + Vite instructions, no Base44 CLI references.
- **`AGENTS.md`, `CLAUDE.md`, `REVE_CULT_MIGRATION_SPEC.md`** — deleted (Base44-platform-only documentation, not applicable to a standalone project).
- **`base44/`** — entire folder deleted (Base44 entity schema definitions, unused outside the platform).
- **`ERROR_REPORT.md`, `CHANGES.md`, `RUN_GUIDE.md`** — added (this file and its two companions).
- **`public/`** — new folder: `favicon.svg` (brand mark) and `manifest.json` (both were referenced by `index.html` but did not exist).

## `src/api/` (new folder — replaces the removed `base44Client.js`)

- **`src/api/localDb.js`** *(new)* — generic localStorage-backed CRUD engine (`list`, `filter`, `get`, `create`, `update`, `delete`) used to implement every data entity.
- **`src/api/entities.js`** *(new)* — exposes `entities.{Order,Address,Review,NewsletterSubscriber,SupportTicket,User}`, a drop-in replacement for `base44.entities.*` with an identical method signature, so every page that used the old SDK needed only an import swap.
- **`src/api/auth.js`** *(new)* — local, client-only authentication: register (with simulated email OTP), login, Google-login simulation, logout, forgot/reset password (simulated email token), `me()`. Seeds two demo accounts (admin + customer) on first run — see `RUN_GUIDE.md`.
- **`src/api/base44Client.js`** — deleted.

## `src/lib/`

- **`AuthContext.jsx`** — fully rewritten to use `src/api/auth.js` instead of the Base44 SDK. Same `useAuth()` hook shape consumers already expected (`user`, `isAuthenticated`, `isLoadingAuth`, `logout`, etc.), plus new actions (`login`, `loginWithGoogle`, `register`, `verifyOtp`, `resendOtp`, `resetPasswordRequest`, `resetPassword`).
- **`app-params.js`** — deleted (only existed to configure the Base44 SDK client).
- **`PageNotFound.jsx`** — no longer calls `base44.auth.me()` via React Query; reads auth state from `useAuth()` instead.
- **`query-client.js`, `utils.js`** — unchanged (already correct).

## `src/context/`

- **`StoreContext.jsx`** — unchanged (already correct; verified cart/wishlist/recently-viewed logic).

## `src/components/`

- **`ProtectedRoute.jsx`** — simplified: removed the Base44 "user not registered" branch that no longer applies.
- **`UserNotRegisteredError.jsx`** — deleted (only used by the removed Base44 app-gate flow).
- **`layout/Footer.jsx`** — newsletter subscribe now calls `entities.NewsletterSubscriber.create(...)` instead of `base44.entities...`.
- **`store/ReviewSection.jsx`** — reviews now read/write via `entities.Review` instead of `base44.entities.Review`.
- **`admin/*`, `AuthLayout.jsx`, `GoogleIcon.jsx`, `ScrollToTop.jsx`** — unchanged (already correct).

## `src/pages/`

- **`Login.jsx`** — now calls `useAuth().login(...)` / `useAuth().loginWithGoogle()` instead of `base44.auth.*`. Added a small demo-credentials hint under the form.
- **`Register.jsx`** — now calls `useAuth().register(...)`, `.verifyOtp(...)`, `.resendOtp(...)`, `.loginWithGoogle()`. The OTP screen is unchanged visually; the demo verification code is now surfaced via a toast since there's no mail server.
- **`ForgotPassword.jsx`** — now calls `useAuth().resetPasswordRequest(...)`; demo reset link surfaced via a toast.
- **`ResetPassword.jsx`** — now calls `useAuth().resetPassword(...)`.
- **`Profile.jsx`** — orders/addresses now fetched via `entities.Order` / `entities.Address`.
- **`Checkout.jsx`** — order creation now via `entities.Order.create(...)`.
- **`OrderConfirmation.jsx`** — order lookup now via `entities.Order.filter(...)`.
- **`Support.jsx`** — support ticket submission now via `entities.SupportTicket.create(...)`.
- **`admin/Customers.jsx`, `admin/Dashboard.jsx`, `admin/Feedback.jsx`, `admin/Orders.jsx`, `admin/OrderDetail.jsx`, `admin/Products.jsx`, `admin/Users.jsx`** — all data calls switched from `base44.entities.*` to `entities.*`. `admin/Users.jsx` copy updated to remove a reference to "the Base44 dashboard."
- **`admin/customerDetail.jsx` → renamed to `admin/CustomerDetail.jsx`** (fixes the broken import in `App.jsx`); data calls switched to `entities.*`.
- **`About.jsx`** — removed an unused `useState` import (lint fix, no behavior change).
- **`Shop.jsx`, `Cart.jsx`, `Wishlist.jsx`, `ProductDetail.jsx`** — unchanged (already correct, verified during audit).

## `src/App.jsx`

- Removed the Base44 "app public settings" loading branch and the `authError` / `user_not_registered` / `auth_required` handling (those concepts don't exist without a hosted app gate). The route table itself (all page + admin routes) is unchanged.

## `src/main.jsx`

- Removed the duplicate `<StoreProvider>` wrapper (the app now mounts the store context exactly once, inside `App.jsx`).

## `src/components/layout/Navbar.jsx`, `src/components/store/ReviewSection.jsx`, `src/pages/admin/Products.jsx`

- Removed unused icon imports (`Sparkles`, `ThumbsUp`, `Trophy`) flagged by `eslint --fix`; no behavior change.

## Data / styling

- **`src/data/products.js`, `src/pages/Home.jsx`** — left as-is; still reference `media.base44.com` image URLs (static assets only, not an SDK dependency — see `ERROR_REPORT.md` §1 for why these were intentionally kept).
- **`src/index.css`, `src/index.css` design tokens, all component styling/animations/branding** — unchanged. No visual/design regressions were introduced; only broken plumbing (Tailwind config filename, Base44 SDK calls) was fixed.

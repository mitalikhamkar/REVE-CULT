# RUN_GUIDE.md — How to Run REVE CULT

This is a standard React + Vite project. It has **no backend and no
external services to configure** — everything (accounts, cart, orders,
reviews, support tickets) runs in the browser using `localStorage`.

## Requirements

- **Node.js 18 or newer** (Node 20/22 recommended). Check with `node -v`.
- **npm 9 or newer** (ships with modern Node). Check with `npm -v`.
- This project was built and verified against **Node v22 / npm v10**.

## 1. Install dependencies

From the project root (the folder containing `package.json`):

```bash
npm install
```

This should complete with no errors and `0 vulnerabilities`.

## 2. Start the dev server

```bash
npm run dev
```

Vite will print a local URL, typically:

```
➜  Local:   http://localhost:5173/
```

Open that URL in your browser. The dev server supports hot module reload —
edits to any file under `src/` will update the page instantly.

## 3. Demo accounts

Two accounts are seeded automatically the first time the app loads:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@revecult.com` | `admin123` |
| Customer | `demo@revecult.com` | `demo1234` |

Log in with the admin account and visit **`/admin`** to see the admin
dashboard, orders, customers, product performance, feedback, and user-role
management screens.

## 4. Sending real verification emails (sign-up code / password reset)

By default, when someone registers or requests a password reset, there's no
mail server to actually deliver the code — so the app shows it on-screen
via a "demo mode" notification instead. To send a **real email** to the
user's inbox, connect a free [EmailJS](https://www.emailjs.com) account
(EmailJS lets a static frontend send email directly from the browser,
without needing a backend server):

1. Go to <https://www.emailjs.com> and create a free account.
2. **Email Services** → **Add New Service** → connect Gmail (or any
   provider) → copy the **Service ID** it gives you.
3. **Email Templates** → **Create New Template**. Use these variables
   anywhere in the subject/body: `{{to_email}}`, `{{title}}`, `{{message}}`,
   `{{code}}`. For example:
   - To: `{{to_email}}`
   - Subject: `{{title}}`
   - Body: `{{message}}`

   Copy the **Template ID**.
4. **Account** → **General** → copy your **Public Key**.
5. In the project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   and fill in the three values:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxx
   ```
6. Restart the dev server (`npm run dev`) so Vite picks up the new env vars.

That's it — sign-up codes and password-reset links will now be emailed for
real. If any of the three values are missing, the app automatically falls
back to demo mode (on-screen code) so the flow never breaks.

**Note:** `.env` is already in `.gitignore` — never commit real API keys.

## 5. Building for production

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## 6. Linting

```bash
npm run lint        # check
npm run lint:fix     # auto-fix what it can
```

## Where data lives

Everything is stored in your browser's `localStorage`, under these keys:

- `reve_users` — registered accounts
- `reve_session` — the currently logged-in user
- `reve_cart`, `reve_wishlist`, `reve_recent` — shopping state
- `reve_db_Order`, `reve_db_Review`, `reve_db_Address`, `reve_db_SupportTicket`, `reve_db_NewsletterSubscriber` — app data created while using the site

Because there's no server, data does **not** sync across browsers/devices,
and clearing your browser's site data (or using a private/incognito window)
will reset the app back to just the two demo accounts.

## Troubleshooting

**`npm install` fails / hangs**
Delete `node_modules` and `package-lock.json`, then try again:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port 5173 already in use**
Run on a different port:
```bash
npm run dev -- --port 5180
```

**Blank page / "Cannot find module '@/...'" errors**
Make sure you're running commands from the project root (the folder that
contains `package.json`, `vite.config.js`, and `src/`), not from inside
`src/`.

**Styles look unstyled / Tailwind classes not applying**
Make sure `tailwind.config.js` (not `tailwaind.config.js`) exists at the
project root — this was a bug in an earlier version of this project and has
been fixed, but if you ever rename or move that file, Tailwind will stop
picking up the custom design tokens (`blush`, `sage`, `gold`, `cream`,
`border`, etc.).

**I got logged out / lost my cart after clearing browser data**
Expected — see "Where data lives" above. This is a client-only prototype
with no backend, so `localStorage` *is* the database.

**I set up EmailJS but I'm still seeing the on-screen code instead of an email**
- Make sure the file is named exactly `.env` (not `.env.example`) and sits
  in the project root next to `package.json`.
- Restart `npm run dev` after creating/editing `.env` — Vite only reads env
  vars at startup.
- Open your browser's dev console while registering; a failed EmailJS send
  logs the exact error there (e.g. wrong Service/Template ID, or an EmailJS
  account that hasn't verified its connected email service yet).
- Check your spam folder — some providers flag EmailJS's sending domain.

**I want to connect a real backend**
Replace the contents of `src/api/auth.js` and `src/api/entities.js` with
real HTTP calls to your API. Every page in `src/pages/` already calls these
two modules through a consistent interface (`entities.Order.create(...)`,
`useAuth().login(...)`, etc.), so no other files need to change.

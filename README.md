# REVE CULT

REVE CULT is a women-first consumer electronics storefront — premium wireless
earbuds, accessories, and apparel presented with a soft, editorial aesthetic.

This is a **standard React + Vite** project. It has no ties to any
proprietary app platform: authentication, the shopping cart, orders,
reviews, and support tickets are all implemented with plain React state,
Context API, and the browser's `localStorage`, so the whole app runs
entirely in the browser with zero backend setup.

## Tech stack

- [React 18](https://react.dev/) with hooks
- [Vite](https://vitejs.dev/) for dev server & bundling
- [React Router v6](https://reactrouter.com/) for routing
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) style primitives (Radix UI under the hood)
- [Lucide React](https://lucide.dev/) icons
- [TanStack Query](https://tanstack.com/query) for a small amount of client-side data caching
- [Recharts](https://recharts.org/) for the admin dashboard charts
- Context API + `localStorage` for cart, wishlist, auth, and the "database" (orders, reviews, addresses, support tickets)

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically **http://localhost:5173**).

See `RUN_GUIDE.md` for full setup instructions, demo login credentials, and
troubleshooting tips.

## Project structure

```
src/
  api/            Local "backend": auth.js (accounts/sessions), entities.js
                   (Orders, Reviews, Addresses, etc.), localDb.js (generic
                   localStorage CRUD engine)
  components/      Shared UI (layout, admin, store, shadcn/ui primitives)
  context/         StoreContext — cart / wishlist / recently viewed
  data/            Static product catalog
  lib/             AuthContext, small utilities
  pages/           Route-level pages, including pages/admin/* for the admin panel
```

## Admin panel

Visit `/admin` while logged in as an admin account. See `RUN_GUIDE.md` for
demo credentials.

## Notes

- This project stores all data (accounts, orders, reviews, etc.) in your
  browser's `localStorage`. There is no server, so data does not sync across
  devices/browsers and clearing site data will reset the app.
- Product photography currently uses AI-generated placeholder images.

# FIREBASE_SETUP.md — connecting this project to your Firebase project

This app now uses **Firebase Authentication** (email/password + Google) and
**Firestore** (orders, addresses, reviews, support tickets, newsletter
subscribers, and user profiles/roles). Nothing is stored in `localStorage`
anymore.

## 1. Enable the providers you need

Firebase Console -> **Authentication** -> **Sign-in method**:
- Enable **Email/Password**.
- Enable **Google**. Set a support email when prompted.

Firebase Console -> **Authentication** -> **Settings** -> **Authorized
domains**: add every domain you'll sign in from — `localhost` is included by
default, but **your production domain (e.g. `revecult.com` or your Vercel/
Netlify URL) must be added here too, or Google sign-in will open a pop-up
that never completes** (this is the single most common cause of "a tab
opens but I can't get in").

## 2. Create the Firestore database

Firebase Console -> **Firestore Database** -> **Create database** -> start
in **production mode** (the rules below lock it down properly, so
"test mode" isn't needed).

## 3. Paste in these security rules

Firebase Console -> **Firestore Database** -> **Rules** -> replace
everything with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }
    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }
    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users can read/edit their own profile; admins can read/edit any
    // profile (needed for "grant admin access" in the admin panel).
    // Nobody but an admin may change the `role` field on someone else.
    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create: if isOwner(uid);
      allow update: if isOwner(uid) || isAdmin();
      allow delete: if isAdmin();
    }

    // Orders / addresses / reviews / support tickets: owners can create and
    // read their own; admins can read/update/delete everything (needed for
    // the admin dashboard, order management, and feedback moderation).
    match /{collection}/{docId}
        where collection in ['orders', 'addresses', 'reviews', 'supportTickets'] {
      allow create: if isSignedIn();
      allow read: if isAdmin() || (isSignedIn() && resource.data.created_by_id == request.auth.uid);
      allow update, delete: if isAdmin();
    }

    // Newsletter signups: anyone can subscribe, only admins can read the list.
    match /newsletterSubscribers/{docId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
  }
}
```

> Note: the `where collection in [...]` match-group syntax requires a recent
> Firestore rules version. If your console rejects it, just duplicate the
> block four times with the collection names hardcoded
> (`match /orders/{docId} { ... }`, `match /addresses/{docId} { ... }`, etc.)
> — functionally identical, just more verbose.

## 4. Make your first admin account

There's no seeded admin account anymore (that was a `localStorage`-only
trick). To create one:
1. Register a normal account through the app's `/register` page.
2. Firebase Console -> **Firestore Database** -> `users` collection -> find
   the document with your uid -> edit the `role` field from `"user"` to
   `"admin"`.
3. Log out and back in (or just refresh) — you'll now see `/admin`.

## 5. Fill in `.env`

```bash
cp .env.example .env
```
Fill in the six `VITE_FIREBASE_*` values from Firebase Console -> Project
settings -> General -> "Your apps" -> SDK setup and configuration. Restart
`npm run dev` afterward — Vite only reads `.env` at startup.

## 6. (Optional) Real password-reset redirect

By default Firebase's reset email sends people to a generic Firebase-hosted
page. To make the link land back on your own `/reset-password` page (which
this app already handles): Firebase Console -> **Authentication** ->
**Templates** -> **Password reset** -> edit -> **Customize action URL** ->
set it to `https://yourdomain.com/reset-password` (or
`http://localhost:5173/reset-password` while developing).

## 7. (Optional) Real email delivery for the sign-up OTP code

Firebase Auth doesn't have a built-in 6-digit-code flow, so the OTP is still
sent via EmailJS (`src/lib/email.js`), same as before. Fill in the three
`VITE_EMAILJS_*` values in `.env` to send real emails; leave them blank to
keep "demo mode" (the code shows in an on-screen toast instead). See
`RUN_GUIDE.md` for the EmailJS setup steps.

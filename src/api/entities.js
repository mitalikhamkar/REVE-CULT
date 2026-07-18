/**
 * entities.js
 * ---------------------------------------------------------------------------
 * Drop-in replacement for the old `base44.entities` object. Every page that
 * used to call `base44.entities.Order.create(...)` etc. now imports
 * `{ entities }` from this file and calls `entities.Order.create(...)`.
 *
 * Order / Address / Review / NewsletterSubscriber / SupportTicket are plain
 * localStorage-backed tables (see localDb.js).
 *
 * User is special: it reads/writes the same "reve_users" table that the auth
 * module (auth.js) manages, so that admin actions like "grant admin access"
 * are reflected immediately for the logged-in user.
 * ---------------------------------------------------------------------------
 */

import { createEntity } from "@/api/localDb";
import { USERS_STORAGE_KEY } from "@/api/auth";

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function readUsers() {
  return safeParse(localStorage.getItem(USERS_STORAGE_KEY), []);
}

function writeUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/** Strips the password field before handing user records to the UI. */
function toPublicUser(user) {
  if (!user) return user;
   
  const { password, ...publicUser } = user;
  return publicUser;
}

const UserEntity = {
  async list() {
    return readUsers().map(toPublicUser);
  },
  async filter(query = {}) {
    const users = readUsers();
    return users
      .filter((u) => Object.entries(query).every(([k, v]) => u[k] === v))
      .map(toPublicUser);
  },
  async get(id) {
    const user = readUsers().find((u) => u.id === id);
    if (!user) throw new Error(`User with id "${id}" was not found`);
    return toPublicUser(user);
  },
  async update(id, data) {
    const users = readUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error(`User with id "${id}" was not found`);
    users[index] = { ...users[index], ...data };
    writeUsers(users);
    return toPublicUser(users[index]);
  },
  async delete(id) {
    writeUsers(readUsers().filter((u) => u.id !== id));
  },
};

export const entities = {
  Order: createEntity("Order"),
  Address: createEntity("Address"),
  Review: createEntity("Review"),
  NewsletterSubscriber: createEntity("NewsletterSubscriber"),
  SupportTicket: createEntity("SupportTicket"),
  User: UserEntity,
};

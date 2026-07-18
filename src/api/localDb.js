/**
 * localDb.js
 * ---------------------------------------------------------------------------
 * A tiny, dependency-free "database" that persists data to the browser's
 * localStorage. It replaces the old Base44 SDK entity client
 * (`base44.entities.<Name>`) with a plain, framework-agnostic implementation
 * that any React developer can read, edit, or swap out for a real backend.
 *
 * Every entity created with `createEntity()` exposes the same methods the
 * rest of the app already expects (because it mirrors the shape of the old
 * Base44 SDK calls that were scattered around the codebase):
 *
 *   entity.list(sort)      -> Promise<Array>
 *   entity.filter(query)   -> Promise<Array>
 *   entity.get(id)         -> Promise<Object>
 *   entity.create(data)    -> Promise<Object>
 *   entity.update(id,data) -> Promise<Object>
 *   entity.delete(id)      -> Promise<void>
 *
 * All records automatically get an `id`, a `created_date`, and — when a user
 * is logged in — a `created_by_id` / `created_by_email` so the rest of the
 * app can scope data ("my orders", "my reviews", etc.) exactly like before.
 * ---------------------------------------------------------------------------
 */

const DB_PREFIX = "reve_db_";

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function readTable(name) {
  return safeParse(localStorage.getItem(DB_PREFIX + name), []);
}

function writeTable(name, rows) {
  localStorage.setItem(DB_PREFIX + name, JSON.stringify(rows));
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
}

/** Reads the currently logged-in user (if any) from the auth session. */
function getCurrentSessionUser() {
  try {
    const raw = localStorage.getItem("reve_session");
    const session = safeParse(raw, null);
    if (!session?.userId) return null;
    const users = safeParse(localStorage.getItem("reve_users"), []);
    return users.find((u) => u.id === session.userId) || null;
  } catch {
    return null;
  }
}

function matchesQuery(row, query) {
  return Object.entries(query).every(([key, value]) => {
    if (value === undefined) return true;
    return row[key] === value;
  });
}

function sortRows(rows, sort) {
  if (!sort) return rows;
  const direction = sort.startsWith("-") ? -1 : 1;
  const field = sort.startsWith("-") ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av === bv) return 0;
    if (av === undefined || av === null) return 1;
    if (bv === undefined || bv === null) return -1;
    return av > bv ? direction : -direction;
  });
}

/**
 * Creates a CRUD interface for a named entity/table.
 * @param {string} name - Table name, e.g. "Order", "Review".
 */
export function createEntity(name) {
  return {
    async list(sort) {
      const rows = readTable(name);
      return sortRows(rows, sort || "-created_date");
    },

    async filter(query = {}) {
      const rows = readTable(name);
      return sortRows(rows.filter((row) => matchesQuery(row, query)), "-created_date");
    },

    async get(id) {
      const rows = readTable(name);
      const row = rows.find((r) => r.id === id);
      if (!row) throw new Error(`${name} with id "${id}" was not found`);
      return row;
    },

    async create(data) {
      const rows = readTable(name);
      const currentUser = getCurrentSessionUser();
      const record = {
        id: generateId(),
        created_date: new Date().toISOString(),
        created_by_id: currentUser?.id,
        created_by_email: currentUser?.email,
        ...data,
      };
      rows.push(record);
      writeTable(name, rows);
      return record;
    },

    async update(id, data) {
      const rows = readTable(name);
      const index = rows.findIndex((r) => r.id === id);
      if (index === -1) throw new Error(`${name} with id "${id}" was not found`);
      rows[index] = { ...rows[index], ...data, updated_date: new Date().toISOString() };
      writeTable(name, rows);
      return rows[index];
    },

    async delete(id) {
      const rows = readTable(name);
      writeTable(name, rows.filter((r) => r.id !== id));
    },
  };
}

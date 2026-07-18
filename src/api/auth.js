/**
 * auth.js
 * ---------------------------------------------------------------------------
 * A self-contained, client-only authentication system that replaces the old
 * `base44.auth.*` calls. There is no backend server in this project, so
 * emails are sent directly from the browser via EmailJS (see src/lib/email.js).
 * If EmailJS isn't configured yet, this file automatically falls back to
 * "demo mode" — returning the code/token to the caller so the UI can show it
 * on-screen instead of silently failing.
 *
 * NOTE: Passwords are obfuscated with base64 (NOT real hashing/encryption).
 * This is a client-side prototype with no server, so there is no way to do
 * real password security here. If you connect a real backend, replace the
 * contents of this file with real HTTP calls and delete the obfuscation.
 * ---------------------------------------------------------------------------
 */

import { sendOtpEmail, sendPasswordResetEmail } from "@/lib/email";

export const USERS_STORAGE_KEY = "reve_users";
const SESSION_KEY = "reve_session";
const PENDING_SIGNUPS_KEY = "reve_pending_signups";
const PASSWORD_RESETS_KEY = "reve_password_resets";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESET_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateToken() {
  return generateId().replace(/-/g, "");
}

function obfuscate(password) {
  try {
    return btoa(unescape(encodeURIComponent(password)));
  } catch {
    return password;
  }
}

function toPublicUser(user) {
  if (!user) return null;
   
  const { password, ...publicUser } = user;
  return publicUser;
}

// ---- storage helpers -------------------------------------------------

function getUsers() {
  return safeParse(localStorage.getItem(USERS_STORAGE_KEY), []);
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getPendingSignups() {
  return safeParse(localStorage.getItem(PENDING_SIGNUPS_KEY), {});
}

function savePendingSignups(pending) {
  localStorage.setItem(PENDING_SIGNUPS_KEY, JSON.stringify(pending));
}

function getPasswordResets() {
  return safeParse(localStorage.getItem(PASSWORD_RESETS_KEY), {});
}

function savePasswordResets(resets) {
  localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(resets));
}

function getSession() {
  return safeParse(localStorage.getItem(SESSION_KEY), null);
}

function setSession(userId) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, createdAt: Date.now() }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ---- seed demo accounts so the admin panel & profile are testable ----

function seedIfEmpty() {
  const users = getUsers();
  if (users.length > 0) return;
  saveUsers([
    {
      id: generateId(),
      email: "admin@revecult.com",
      password: obfuscate("admin123"),
      full_name: "REVE Admin",
      role: "admin",
      created_date: new Date().toISOString(),
    },
    {
      id: generateId(),
      email: "demo@revecult.com",
      password: obfuscate("demo1234"),
      full_name: "Demo Customer",
      role: "user",
      created_date: new Date().toISOString(),
    },
  ]);
}
seedIfEmpty();

// ---- public API --------------------------------------------------------

/** Returns the currently logged-in user (public fields only), or null. */
export function getCurrentUser() {
  const session = getSession();
  if (!session?.userId) return null;
  const user = getUsers().find((u) => u.id === session.userId);
  return toPublicUser(user);
}

export async function me() {
  const user = getCurrentUser();
  if (!user) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }
  return user;
}

/** Step 1 of sign-up: validates + stores a pending signup and issues an OTP. */
export async function register({ email, password, full_name = "" }) {
  if (!email || !password) throw new Error("Email and password are required");
  const normalizedEmail = email.trim().toLowerCase();

  if (getUsers().some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error("An account with this email already exists");
  }

  const code = generateOtp();
  const pending = getPendingSignups();
  pending[normalizedEmail] = {
    email: normalizedEmail,
    password: obfuscate(password),
    full_name,
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  };
  savePendingSignups(pending);

  const result = await sendOtpEmail(normalizedEmail, code);
  if (result.sent) {
    return { sent: true };
  }
  // EmailJS isn't configured (or the send failed) — fall back to demo mode
  // so the sign-up flow still works end-to-end without a mail account.
  return { sent: false, devCode: code, reason: result.error };
}

/** Step 2 of sign-up: verifies the OTP and activates the account. */
export async function verifyOtp({ email, otpCode }) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const pending = getPendingSignups();
  const entry = pending[normalizedEmail];

  if (!entry) throw new Error("No pending verification for this email. Please register again.");
  if (Date.now() > entry.expiresAt) throw new Error("This code has expired. Please request a new one.");
  if (entry.code !== otpCode) throw new Error("Invalid verification code");

  const users = getUsers();
  const newUser = {
    id: generateId(),
    email: entry.email,
    password: entry.password,
    full_name: entry.full_name,
    role: "user",
    created_date: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);

  delete pending[normalizedEmail];
  savePendingSignups(pending);

  setSession(newUser.id);
  return { access_token: newUser.id, user: toPublicUser(newUser) };
}

/** Re-issues an OTP for a pending signup. */
export async function resendOtp(email) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const pending = getPendingSignups();
  const entry = pending[normalizedEmail];
  if (!entry) throw new Error("No pending verification for this email. Please register again.");

  const code = generateOtp();
  entry.code = code;
  entry.expiresAt = Date.now() + OTP_EXPIRY_MS;
  pending[normalizedEmail] = entry;
  savePendingSignups(pending);

  const result = await sendOtpEmail(normalizedEmail, code);
  if (result.sent) {
    return { sent: true };
  }
  return { sent: false, devCode: code, reason: result.error };
}

export async function loginViaEmailPassword(email, password) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const user = getUsers().find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user || user.password !== obfuscate(password)) {
    throw new Error("Invalid email or password");
  }
  setSession(user.id);
  return toPublicUser(user);
}

/**
 * Simulated "Continue with Google" — there is no backend to perform a real
 * OAuth handshake, so this signs the user into (or creates) a demo Google
 * account. Swap this out for real OAuth once a backend is available.
 */
export async function loginWithGoogle() {
  const email = "google.user@revecult.com";
  let users = getUsers();
  let user = users.find((u) => u.email === email);
  if (!user) {
    user = {
      id: generateId(),
      email,
      password: obfuscate(generateToken()),
      full_name: "Google User",
      role: "user",
      created_date: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
  }
  setSession(user.id);
  return toPublicUser(user);
}

export function logout() {
  clearSession();
}

/** Generates a password-reset token (simulated email delivery). */
export async function resetPasswordRequest(email) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const user = getUsers().find((u) => u.email.toLowerCase() === normalizedEmail);

  // Always behave the same whether or not the account exists, to avoid
  // leaking which emails are registered.
  if (!user) return { sent: true };

  const token = generateToken();
  const resets = getPasswordResets();
  resets[token] = { email: normalizedEmail, expiresAt: Date.now() + RESET_EXPIRY_MS };
  savePasswordResets(resets);

  const resetUrl = `${window.location.origin}/reset-password?token=${token}`;
  const result = await sendPasswordResetEmail(normalizedEmail, resetUrl);
  if (result.sent) {
    return { sent: true };
  }
  return { sent: false, devToken: token, reason: result.error };
}

export async function resetPassword({ resetToken, newPassword }) {
  const resets = getPasswordResets();
  const entry = resets[resetToken];
  if (!entry) throw new Error("This reset link is invalid or has expired");
  if (Date.now() > entry.expiresAt) throw new Error("This reset link has expired");

  const users = getUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === entry.email);
  if (index === -1) throw new Error("Account not found");

  users[index] = { ...users[index], password: obfuscate(newPassword) };
  saveUsers(users);

  delete resets[resetToken];
  savePasswordResets(resets);

  return { success: true };
}

/**
 * email.js
 * ---------------------------------------------------------------------------
 * Sends real emails from the browser using EmailJS (https://www.emailjs.com).
 *
 * There is no backend server in this project, so a normal SMTP call isn't
 * possible from client-side code. EmailJS solves this: it's a service that
 * accepts an API call straight from the browser and relays it through an
 * email account you connect (Gmail, Outlook, etc.), using a "template" you
 * design in their dashboard.
 *
 * SETUP (one-time, ~5 minutes) — see RUN_GUIDE.md for the full walkthrough:
 *   1. Create a free account at https://www.emailjs.com
 *   2. Add an Email Service (e.g. connect your Gmail) -> copy its Service ID
 *   3. Create an Email Template with these variables in the body:
 *        {{to_email}}  {{title}}  {{message}}  {{code}}
 *      -> copy its Template ID
 *   4. Account > General > copy your Public Key
 *   5. Put all three into a .env file at the project root:
 *        VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
 *        VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
 *        VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxx
 *   6. Restart `npm run dev`
 *
 * Until those env vars are set, sendEmail() returns { sent: false } and the
 * calling code falls back to showing the code on-screen (demo mode) instead
 * of silently failing.
 * ---------------------------------------------------------------------------
 */

import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export function isEmailConfigured() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

/**
 * Sends an email via EmailJS.
 * @param {{to_email: string, title: string, message: string, code?: string}} params
 * @returns {Promise<{sent: boolean, error?: string}>}
 */
export async function sendEmail(params) {
  if (!isEmailConfigured()) {
    return { sent: false, error: "not_configured" };
  }
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, { publicKey: PUBLIC_KEY });
    return { sent: true };
  } catch (err) {
    console.error("EmailJS send failed:", err);
    return { sent: false, error: err?.text || err?.message || "send_failed" };
  }
}

export function sendOtpEmail(email, code) {
  return sendEmail({
    to_email: email,
    title: "Verify your REVE CULT account",
    message: `Your verification code is ${code}. It expires in 10 minutes.`,
    code,
  });
}

export function sendPasswordResetEmail(email, resetUrl) {
  return sendEmail({
    to_email: email,
    title: "Reset your REVE CULT password",
    message: `Click the link to reset your password: ${resetUrl} (expires in 30 minutes)`,
    code: resetUrl,
  });
}

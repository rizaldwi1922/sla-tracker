/**
 * gmailApi.js
 * Service layer untuk komunikasi dengan Laravel Gmail API
 * Menggunakan apiRequest() dari utils/apiRequest.js
 */

import { apiRequest } from "../services/apiRequest";

// ── Sales ─────────────────────────────────────────────────────────────────────

/** GET /api/sales  →  [{ id, name, email }] */
export async function fetchSalesList() {
  return apiRequest({ url: "/sales-gmail" });
}

// ── Inbox ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/gmail/{account}/inbox
 * @param {string|number} accountId  – GmailAccount.id (milik sales)
 * @param {string|null}   pageToken  – pagination token
 * @returns {{ emails: Email[], next_page_token: string|null, total_estimate: number }}
 */
export async function fetchInbox(accountId, pageToken = null) {
  return apiRequest({
    url   : `/gmail/${accountId}/inbox`,
    params: pageToken ? { page_token: pageToken } : null,
  });
}

// ── Sent ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/gmail/{account}/sent
 * @param {string|number} accountId
 * @param {string|null}   pageToken  – pagination token
 * @returns {{ emails: Email[], next_page_token: string|null, total_estimate: number }}
 */
export async function fetchSent(accountId, pageToken = null) {
  return apiRequest({
    url   : `/gmail/${accountId}/sent`,
    params: pageToken ? { page_token: pageToken } : null,
  });
}

// ── Detail ────────────────────────────────────────────────────────────────────

/**
 * GET /api/gmail/{account}/message/{messageId}
 * @param {string|number} accountId
 * @param {string}        messageId
 */
export async function fetchMessageDetail(accountId, messageId) {
  return apiRequest({ url: `/gmail/${accountId}/message/${messageId}` });
}

// ── Parser helpers ────────────────────────────────────────────────────────────

/**
 * Ambil value header dari payload Gmail API (format "full")
 */
export function getHeader(payload, name) {
  return (
    payload?.headers?.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    )?.value ?? null
  );
}

/**
 * Parse string "From" header  →  { name, email }
 * Contoh input: "John Doe <john@example.com>" atau "john@example.com"
 */
export function parseAddress(raw) {
  if (!raw) return { name: "Unknown", email: "" };
  const match = raw.match(/^(.*?)\s*<(.+?)>\s*$/);
  if (match) return { name: match[1].trim() || match[2], email: match[2] };
  return { name: raw, email: raw };
}

/**
 * Parse "To" header (bisa multi-alamat, dipisah koma)
 */
export function parseAddressList(raw) {
  if (!raw) return [];
  return raw.split(",").map((s) => parseAddress(s.trim()));
}

/**
 * Decode body dari Gmail payload (base64url → HTML/text)
 */
export function decodeBody(payload) {
  // Cari part dengan mimeType text/html, fallback text/plain
  const findPart = (parts, mime) =>
    parts?.find((p) => p.mimeType === mime) ??
    parts?.flatMap((p) => findPart(p.parts ?? [], mime) ?? []).find(Boolean);

  const htmlPart  = findPart(payload?.parts, "text/html");
  const plainPart = findPart(payload?.parts, "text/plain");
  const part      = htmlPart ?? plainPart ?? payload;

  const data = part?.body?.data;
  if (!data) return null;

  // base64url → normal base64 → decode
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeURIComponent(
      Array.from(atob(base64))
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    return atob(base64);
  }
}

/**
 * Normalisasi pesan dari format Gmail API "full" ke shape
 * yang dipakai komponen UI.
 */
export function normalizeMessage(raw, salesId) {
  const { payload, id, threadId, snippet, internalDate, labelIds } = raw;

  const from    = parseAddress(getHeader(payload, "From"));
  const to      = parseAddressList(getHeader(payload, "To"));
  const subject = getHeader(payload, "Subject") ?? "(No Subject)";
  const date    = getHeader(payload, "Date");
  const bodyHtml = decodeBody(payload);

  const isInbox = labelIds?.includes("INBOX");
  const isSent  = labelIds?.includes("SENT");
  const isRead  = !labelIds?.includes("UNREAD");

  // Attachments: part yang punya filename
  const attachments = (payload?.parts ?? []).filter(
    (p) => p.filename && p.filename.length > 0
  );

  return {
    id,
    threadId,
    salesId,
    subject,
    snippet,
    from,
    to,
    body_html : bodyHtml,
    is_read   : isRead,
    has_attachment: attachments.length > 0,
    attachments,
    received_at: isInbox ? (date ?? new Date(Number(internalDate)).toISOString()) : null,
    sent_at    : isSent  ? (date ?? new Date(Number(internalDate)).toISOString()) : null,
    labels     : labelIds ?? [],
    raw,
  };
}
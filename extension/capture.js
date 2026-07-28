// @ts-check

export const CAPTURE_HASH_PREFIX = "#capture=";

/** @typedef {"read" | "make" | "keep"} CaptureAction */

/**
 * @typedef {{
 *   version: 1;
 *   url: string;
 *   title: string;
 *   action: CaptureAction;
 * }} CapturePayload
 */

const allowedActions = new Set(["read", "make", "keep"]);

/**
 * @param {string} value
 * @returns {string | null}
 */
export function normaliseCaptureUrl(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2048) return null;

  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * @param {string} value
 */
function encodeUtf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
}

/**
 * @param {string} value
 */
function decodeUtf8(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("Capture data contains unsupported characters.");
  }

  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/**
 * @param {CapturePayload} payload
 */
export function createCaptureHash(payload) {
  const url = normaliseCaptureUrl(payload.url);
  const action = allowedActions.has(payload.action) ? payload.action : null;
  const title = payload.title.replace(/\s+/g, " ").trim().slice(0, 160);

  if (!url || !action) throw new Error("This tab cannot be captured.");

  const safePayload = {
    version: 1,
    url,
    title: title || `Review saved link from ${new URL(url).hostname}`,
    action,
  };

  return `${CAPTURE_HASH_PREFIX}${encodeUtf8(JSON.stringify(safePayload))}`;
}

/**
 * @param {string} hash
 * @returns {{ ok: true; capture: CapturePayload } | { ok: false; error: string }}
 */
export function decodeCaptureHash(hash) {
  if (!hash.startsWith(CAPTURE_HASH_PREFIX)) {
    return { ok: false, error: "No extension capture was found." };
  }

  try {
    const encoded = hash.slice(CAPTURE_HASH_PREFIX.length);
    if (!encoded || encoded.length > 4096) {
      throw new Error("Capture data is missing or too large.");
    }

    const parsed = JSON.parse(decodeUtf8(encoded));
    if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
      throw new Error("Capture version is not supported.");
    }

    const url = normaliseCaptureUrl(
      typeof parsed.url === "string" ? parsed.url : "",
    );
    const title =
      typeof parsed.title === "string"
        ? parsed.title.replace(/\s+/g, " ").trim().slice(0, 160)
        : "";
    const action = allowedActions.has(parsed.action) ? parsed.action : null;

    if (!url || !title || !action) {
      throw new Error("Capture data is incomplete.");
    }

    return {
      ok: true,
      capture: {
        version: 1,
        url,
        title,
        action: /** @type {CaptureAction} */ (action),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Capture data could not be read.",
    };
  }
}

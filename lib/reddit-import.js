// @ts-check

/**
 * @typedef {{
 *   id: string;
 *   url: string;
 *   title: string;
 *   source: "post" | "comment";
 * }} RedditImportItem
 */

/**
 * @typedef {{
 *   items: RedditImportItem[];
 *   skipped: number;
 *   errors: string[];
 * }} RedditImportResult
 */

/**
 * Parse a CSV document without sending it anywhere. Supports quoted commas,
 * escaped quotes and line breaks inside quoted fields.
 *
 * @param {string} input
 * @returns {string[][]}
 */
function parseCsvRows(input) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (quoted) {
      if (character === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  row.push(field.replace(/\r$/, ""));
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

/**
 * @param {string} value
 */
function normaliseHeader(value) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/**
 * @param {string} value
 * @returns {string | null}
 */
export function normaliseRedditUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const candidate = trimmed.startsWith("/")
      ? new URL(trimmed, "https://www.reddit.com")
      : new URL(
          /^[a-z][a-z\d+.-]*:/i.test(trimmed)
            ? trimmed
            : `https://${trimmed}`,
        );
    const hostname = candidate.hostname.toLowerCase();

    if (hostname !== "reddit.com" && !hostname.endsWith(".reddit.com")) {
      return null;
    }

    candidate.protocol = "https:";
    candidate.hostname = "www.reddit.com";
    candidate.username = "";
    candidate.password = "";
    candidate.search = "";
    candidate.hash = "";

    return candidate.toString();
  } catch {
    return null;
  }
}

/**
 * @param {string} url
 * @param {string} id
 * @param {"post" | "comment"} source
 */
function deriveRedditTitle(url, id, source) {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  const commentsIndex = parts.indexOf("comments");
  const rawSlug =
    commentsIndex >= 0 ? parts[commentsIndex + 2] : parts.at(-1);

  if (rawSlug && rawSlug !== id && !/^t[13]_[a-z\d]+$/i.test(rawSlug)) {
    const readable = decodeURIComponent(rawSlug)
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (readable.length >= 4) {
      return `${source === "comment" ? "Comment in" : "Reddit"}: ${
        readable.charAt(0).toUpperCase() + readable.slice(1)
      }`;
    }
  }

  return `Saved Reddit ${source} ${id || "link"}`;
}

/**
 * Parse Reddit's official saved_posts.csv or saved_comments.csv export.
 * The official files normally contain `id,permalink`; additional URL and title
 * column names are accepted so the importer remains useful across export
 * variants.
 *
 * @param {string} input
 * @param {string} [fileName]
 * @returns {RedditImportResult}
 */
export function parseRedditExportCsv(
  input,
  fileName = "saved_posts.csv",
) {
  const rows = parseCsvRows(input);
  if (rows.length === 0) {
    return { items: [], skipped: 0, errors: ["The CSV file is empty."] };
  }

  const headers = rows[0].map(normaliseHeader);
  const urlIndex = ["permalink", "url", "link", "full_link"]
    .map((header) => headers.indexOf(header))
    .find((index) => index >= 0);
  const idIndex = headers.indexOf("id");
  const titleIndex = headers.indexOf("title");

  if (urlIndex === undefined) {
    return {
      items: [],
      skipped: Math.max(0, rows.length - 1),
      errors: ["No permalink or URL column was found."],
    };
  }

  /** @type {"post" | "comment"} */
  const source = fileName.toLowerCase().includes("comment") ? "comment" : "post";
  const items = [];
  const errors = [];
  const seen = new Set();
  let skipped = 0;

  for (const row of rows.slice(1)) {
    const rawUrl = row[urlIndex] ?? "";
    const url = normaliseRedditUrl(rawUrl);
    if (!url) {
      if (row.some((value) => value.trim() !== "")) skipped += 1;
      continue;
    }

    if (seen.has(url)) {
      skipped += 1;
      continue;
    }

    const id = (idIndex >= 0 ? row[idIndex] : "")?.trim() || crypto.randomUUID();
    const suppliedTitle =
      (titleIndex >= 0 ? row[titleIndex] : "")?.trim() ?? "";

    items.push({
      id,
      url,
      title: suppliedTitle || deriveRedditTitle(url, id, source),
      source,
    });
    seen.add(url);
  }

  if (items.length === 0 && skipped > 0) {
    errors.push("No valid Reddit permalinks were found.");
  }

  return { items, skipped, errors };
}

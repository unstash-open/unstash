"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  normaliseRedditUrl,
  parseRedditExportCsv,
} from "../../lib/reddit-import";
import {
  CAPTURE_HASH_PREFIX,
  decodeCaptureHash,
  normaliseCaptureUrl,
} from "../../extension/capture";

type ActionType = "read" | "make" | "keep";

type VaultItem = {
  id: string;
  url: string;
  title: string;
  action: ActionType;
  createdAt: string;
  completed: boolean;
};

const STORAGE_KEY = "unstash-prototype-v1";
const actions = new Set<ActionType>(["read", "make", "keep"]);

const examples: VaultItem[] = [
  {
    id: "example-1",
    url: "https://www.reddit.com/r/learnprogramming/",
    title: "Try the first exercise from that practical guide",
    action: "make",
    createdAt: new Date().toISOString(),
    completed: false,
  },
  {
    id: "example-2",
    url: "https://www.reddit.com/r/design/",
    title: "Read the notes on scalable design systems",
    action: "read",
    createdAt: new Date().toISOString(),
    completed: false,
  },
];

function deriveTitle(value: string) {
  try {
    const url = new URL(value);
    const slug = url.pathname
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.replaceAll("-", " ")
      .replaceAll("_", " ");
    if (!slug || slug.length < 4) return `Review saved link from ${url.hostname}`;
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  } catch {
    return "Review this saved link";
  }
}

function isVaultItem(value: unknown): value is VaultItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<VaultItem>;

  return (
    typeof item.id === "string" &&
    typeof item.url === "string" &&
    typeof item.title === "string" &&
    typeof item.action === "string" &&
    actions.has(item.action as ActionType) &&
    typeof item.createdAt === "string" &&
    typeof item.completed === "boolean"
  );
}

export function VaultPrototype() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [action, setAction] = useState<ActionType>("read");
  const [importAction, setImportAction] = useState<ActionType>("read");
  const [importMessage, setImportMessage] = useState("");
  const [didImport, setDidImport] = useState(false);
  const [captureMessage, setCaptureMessage] = useState("");
  const [didCapture, setDidCapture] = useState(false);
  const [query, setQuery] = useState("");
  const [didExport, setDidExport] = useState(false);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      let loadedItems: VaultItem[] = [];

      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        if (Array.isArray(parsed)) loadedItems = parsed.filter(isVaultItem);
      } catch {
        loadedItems = [];
      }

      if (window.location.hash.startsWith(CAPTURE_HASH_PREFIX)) {
        const result = decodeCaptureHash(window.location.hash);
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );

        if (result.ok) {
          const capturedUrl = normaliseCaptureUrl(result.capture.url);
          const duplicate = loadedItems.some(
            (item) => normaliseCaptureUrl(item.url) === capturedUrl,
          );

          if (duplicate) {
            setCaptureMessage("That tab is already in your local queue.");
          } else {
            loadedItems = [
              {
                id: `extension-${crypto.randomUUID()}`,
                url: result.capture.url,
                title: result.capture.title,
                action: result.capture.action,
                createdAt: new Date().toISOString(),
                completed: false,
              },
              ...loadedItems,
            ];
            setCaptureMessage(
              `Captured locally · ${result.capture.action.toUpperCase()} · ${result.capture.title}`,
            );
          }
          setDidCapture(true);
        } else {
          setCaptureMessage(`Capture could not be imported: ${result.error}`);
        }
      }

      setItems(loadedItems);
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(needle) ||
        item.url.toLowerCase().includes(needle) ||
        item.action.includes(needle),
    );
  }, [items, query]);

  const addItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) return;

    try {
      new URL(url);
    } catch {
      return;
    }

    const next: VaultItem = {
      id: crypto.randomUUID(),
      url: url.trim(),
      title: title.trim() || deriveTitle(url),
      action,
      createdAt: new Date().toISOString(),
      completed: false,
    };

    setItems((current) => [next, ...current]);
    setUrl("");
    setTitle("");
    setAction("read");
  };

  const exportMarkdown = () => {
    const content = [
      "# My Unstash queue",
      "",
      ...items.flatMap((item) => [
        `- [${item.completed ? "x" : " "}] **${item.title}**`,
        `  - Action: ${item.action}`,
        `  - Link: ${item.url}`,
      ]),
      "",
    ].join("\n");
    const blob = new Blob([content], { type: "text/markdown" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "unstash-queue.md";
    anchor.click();
    URL.revokeObjectURL(href);
    setDidExport(true);
  };

  const importRedditCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    try {
      const results = await Promise.all(
        files.map(async (file) =>
          parseRedditExportCsv(await file.text(), file.name),
        ),
      );
      const candidates = results.flatMap((result) => result.items);
      const seen = new Set(
        items.map((item) => normaliseRedditUrl(item.url) ?? item.url),
      );
      const imported: VaultItem[] = [];
      let duplicateCount = 0;

      for (const candidate of candidates) {
        if (seen.has(candidate.url)) {
          duplicateCount += 1;
          continue;
        }
        seen.add(candidate.url);
        imported.push({
          id: `reddit-${candidate.source}-${candidate.id}-${crypto.randomUUID()}`,
          url: candidate.url,
          title: candidate.title,
          action: importAction,
          createdAt: new Date().toISOString(),
          completed: false,
        });
      }

      const skippedCount =
        results.reduce((total, result) => total + result.skipped, 0) +
        duplicateCount;
      const errors = results.flatMap((result) => result.errors);

      if (imported.length > 0) {
        setItems((current) => [...imported, ...current]);
        setDidImport(true);
        setImportMessage(
          `${imported.length} Reddit save${imported.length === 1 ? "" : "s"} imported locally${
            skippedCount > 0 ? ` · ${skippedCount} skipped` : ""
          }.`,
        );
      } else {
        setImportMessage(
          errors[0] ??
            "Nothing new was imported. Those links may already be in your queue.",
        );
      }
    } catch {
      setImportMessage(
        "That file could not be read. Choose saved_posts.csv or saved_comments.csv from a Reddit data export.",
      );
    } finally {
      input.value = "";
    }
  };

  const showSupport =
    didCapture ||
    didImport ||
    didExport ||
    items.length >= 3 ||
    items.some((item) => item.completed);

  return (
    <>
      {captureMessage ? (
        <div className="capture-result" role="status">
          <span className="status-pill">
            {didCapture ? "EXTENSION CAPTURED" : "CAPTURE ERROR"}
          </span>
          <p>{captureMessage}</p>
        </div>
      ) : null}

      <section className="prototype-toolbar" aria-label="Add a saved link">
        <form className="add-form" onSubmit={addItem}>
          <div className="form-field">
            <label htmlFor="saved-url">Saved link</label>
            <input
              id="saved-url"
              type="url"
              required
              placeholder="https://reddit.com/r/…"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="saved-title">Next step</label>
            <input
              id="saved-title"
              type="text"
              maxLength={100}
              placeholder="Try the first exercise"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="saved-action">Action</label>
            <select
              id="saved-action"
              value={action}
              onChange={(event) => setAction(event.target.value as ActionType)}
            >
              <option value="read">Read</option>
              <option value="make">Make</option>
              <option value="keep">Keep</option>
            </select>
          </div>
          <button className="add-button" type="submit">Add to queue</button>
        </form>
        <p className="prototype-note">
          Privacy check: this form makes no network request. Refresh the page—your
          queue stays on this device.
        </p>
      </section>

      <section className="reddit-import" aria-labelledby="reddit-import-title">
        <div className="reddit-import-copy">
          <span className="status-pill">SHIPPED · PERMISSION-FREE</span>
          <h2 id="reddit-import-title">Import your Reddit saves locally.</h2>
          <p>
            Choose <strong>saved_posts.csv</strong> or{" "}
            <strong>saved_comments.csv</strong> from Reddit&apos;s official data
            export. Unstash reads the file in this browser—no Reddit login,
            OAuth token or upload.
          </p>
          <ul>
            <li>The CSV never leaves this device.</li>
            <li>Duplicate links are skipped automatically.</li>
            <li>Every imported item gets the action you choose.</li>
          </ul>
        </div>
        <div className="reddit-import-controls">
          <div className="form-field">
            <label htmlFor="reddit-import-action">Action for imported saves</label>
            <select
              id="reddit-import-action"
              value={importAction}
              onChange={(event) =>
                setImportAction(event.target.value as ActionType)
              }
            >
              <option value="read">Read</option>
              <option value="make">Make</option>
              <option value="keep">Keep</option>
            </select>
          </div>
          <label className="button button-dark reddit-file-button">
            Choose Reddit CSV
            <input
              accept=".csv,text/csv"
              aria-describedby="reddit-import-status"
              multiple
              onChange={importRedditCsv}
              type="file"
            />
          </label>
          <a
            className="reddit-export-link"
            href="https://www.reddit.com/settings/data-request"
            rel="noreferrer"
            target="_blank"
          >
            Request your Reddit data ↗
          </a>
          <a
            className="reddit-export-link"
            download
            href="/sample-reddit-saves.csv"
          >
            Download a safe sample CSV ↓
          </a>
          <p
            className={importMessage ? "reddit-import-status visible" : "reddit-import-status"}
            id="reddit-import-status"
            aria-live="polite"
          >
            {importMessage || "Ready for Reddit CSV files."}
          </p>
        </div>
      </section>

      <section aria-label="Your saved-link queue">
        <div className="vault-controls">
          <input
            className="vault-search"
            type="search"
            aria-label="Search your queue"
            placeholder="Search links and actions…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="vault-actions">
            <button
              className="small-button"
              type="button"
              onClick={() => setItems(examples)}
            >
              Load example
            </button>
            <button
              className="small-button"
              type="button"
              disabled={items.length === 0}
              onClick={exportMarkdown}
            >
              Export .md
            </button>
          </div>
        </div>

        <div className="vault-stats">
          <h2>Your queue</h2>
          <span>
            {items.filter((item) => !item.completed).length} open ·{" "}
            {items.filter((item) => item.completed).length} done
          </span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="vault-grid">
            {filteredItems.map((item) => (
              <article
                className={`vault-card${item.completed ? " completed" : ""}`}
                key={item.id}
              >
                <div className="vault-card-top">
                  <span className={`type-pill ${item.action}`}>
                    {item.action.toUpperCase()}
                  </span>
                  <button
                    className="delete-button"
                    type="button"
                    aria-label={`Delete ${item.title}`}
                    onClick={() =>
                      setItems((current) =>
                        current.filter((candidate) => candidate.id !== item.id),
                      )
                    }
                  >
                    ×
                  </button>
                </div>
                <h3>{item.title}</h3>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.url}
                </a>
                <div className="vault-card-footer">
                  <span>
                    Added{" "}
                    {new Intl.DateTimeFormat("en", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(item.createdAt))}
                  </span>
                  <button
                    className="done-toggle"
                    type="button"
                    onClick={() =>
                      setItems((current) =>
                        current.map((candidate) =>
                          candidate.id === item.id
                            ? { ...candidate, completed: !candidate.completed }
                            : candidate,
                        ),
                      )
                    }
                  >
                    {item.completed ? "Reopen" : "Done"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div>
              <h3>{items.length === 0 ? "Nothing stashed yet." : "No matches."}</h3>
              <p>
                {items.length === 0
                  ? "Add your first link above or load two clearly labeled example items."
                  : "Try a broader search term."}
              </p>
              {items.length === 0 && (
                <button
                  className="button button-dark"
                  type="button"
                  onClick={() => setItems(examples)}
                >
                  Load example queue
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {showSupport ? (
        <aside className="prototype-support" aria-label="Support the next Unstash milestone">
          <div>
            <span className="status-pill">EXTENSION 0.1 SHIPPED</span>
            <h2>Capture the next tab in one click.</h2>
            <p>
              The Chromium developer preview now captures the active tab with
              one permission and no remote vault. The 500 USDT milestone funds
              cross-browser hardening, automated tests and store-ready packaging.
            </p>
          </div>
          <div className="prototype-support-actions">
            <Link className="button button-dark" href="/extension">
              Install extension 0.1 <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" href="/#fund">
              Optional funding
            </Link>
          </div>
        </aside>
      ) : null}
    </>
  );
}

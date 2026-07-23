"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

export function VaultPrototype() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [action, setAction] = useState<ActionType>("read");
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved) as VaultItem[]);
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
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
  };

  return (
    <>
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
    </>
  );
}

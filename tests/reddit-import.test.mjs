import assert from "node:assert/strict";
import test from "node:test";
import {
  normaliseRedditUrl,
  parseRedditExportCsv,
} from "../lib/reddit-import.js";

test("imports Reddit saved posts from the official id,permalink shape", () => {
  const result = parseRedditExportCsv(`id,permalink
abc123,https://www.reddit.com/r/productivity/comments/abc123/a_better_saved_posts_system/
def456,/r/webdev/comments/def456/a_tiny_local_first_tool/
`);

  assert.equal(result.items.length, 2);
  assert.equal(result.skipped, 0);
  assert.equal(
    result.items[0].title,
    "Reddit: A better saved posts system",
  );
  assert.equal(
    result.items[1].url,
    "https://www.reddit.com/r/webdev/comments/def456/a_tiny_local_first_tool/",
  );
});

test("supports quoted fields, comment exports and duplicate removal", () => {
  const result = parseRedditExportCsv(
    `id,permalink,title
c1,"https://old.reddit.com/r/privacy/comments/p1/topic/c1/","A useful, quoted comment"
c1,"https://www.reddit.com/r/privacy/comments/p1/topic/c1/","Duplicate"
`,
    "saved_comments.csv",
  );

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].source, "comment");
  assert.equal(result.items[0].title, "A useful, quoted comment");
  assert.equal(result.skipped, 1);
});

test("rejects non-Reddit URLs and explains unsupported CSV files", () => {
  assert.equal(normaliseRedditUrl("https://example.com/not-reddit"), null);

  const wrongHeaders = parseRedditExportCsv("name,website\nTest,https://reddit.com/");
  assert.equal(wrongHeaders.items.length, 0);
  assert.match(wrongHeaders.errors[0], /No permalink or URL column/);
});

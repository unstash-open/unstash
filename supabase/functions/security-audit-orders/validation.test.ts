import {
  authorize,
  readBoundedRequestText,
  RequestBodyTooLargeError,
  safeEqual,
  validPayload,
} from "./validation.ts";

const SECRET = "0123456789abcdef0123456789abcdef";
const VALID_EVENT = {
  eventId: "event-123",
  eventType: "order.paid",
  createdAt: "2026-08-03T00:00:00.000Z",
  polarProductId: "e1398921-b9ff-4535-80bf-6e9621c2ea52",
  plan: "beta",
};

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

Deno.test("constant-time comparison distinguishes bearer values", async () => {
  assert(await safeEqual(SECRET, SECRET), "matching values should compare equal");
  assert(!await safeEqual(SECRET, `${SECRET}x`), "different values should not compare equal");
});

Deno.test("custom bearer authorization fails closed", async () => {
  const authorized = new Request("https://queue.example/orders", {
    headers: { Authorization: `Bearer ${SECRET}` },
  });
  const wrongScheme = new Request("https://queue.example/orders", {
    headers: { Authorization: `Basic ${SECRET}` },
  });

  assert(await authorize(authorized, SECRET), "matching bearer should be accepted");
  assert(!await authorize(authorized, "too-short"), "short configured secret should be rejected");
  assert(!await authorize(wrongScheme, SECRET), "non-bearer authorization should be rejected");
});

Deno.test("order validation accepts only mapped event and plan values", () => {
  assert(validPayload(VALID_EVENT), "valid event should be accepted");
  assert(!validPayload({ ...VALID_EVENT, eventType: "customer.created" }), "unknown event should fail");
  assert(!validPayload({ ...VALID_EVENT, plan: "enterprise" }), "unknown plan should fail");
  assert(!validPayload({ ...VALID_EVENT, createdAt: "not-a-date" }), "invalid timestamp should fail");
  assert(!validPayload({ ...VALID_EVENT, polarProductId: "not-a-uuid" }), "invalid product ID should fail");
});

Deno.test("request reader enforces the actual byte limit", async () => {
  const accepted = new Request("https://queue.example/orders", { method: "POST", body: "1234" });
  assert(await readBoundedRequestText(accepted, 4) === "1234", "boundary-sized body should pass");

  const rejected = new Request("https://queue.example/orders", { method: "POST", body: "12345" });
  try {
    await readBoundedRequestText(rejected, 4);
    throw new Error("oversized body should fail");
  } catch (error) {
    assert(error instanceof RequestBodyTooLargeError, "expected the bounded-reader error");
  }
});

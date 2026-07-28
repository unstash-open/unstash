"use client";

import {
  Analytics,
  type BeforeSendEvent,
} from "@vercel/analytics/next";

function stripPrivateUrlParts(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);

    return {
      ...event,
      url: `${url.origin}${url.pathname}`,
    };
  } catch {
    return null;
  }
}

export function PrivacyAnalytics() {
  return <Analytics beforeSend={stripPrivateUrlParts} />;
}

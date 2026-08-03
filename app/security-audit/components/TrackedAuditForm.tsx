"use client";

import { track } from "@vercel/analytics/react";
import type { FormEvent, ReactNode } from "react";

export function TrackedAuditForm({ children }: { children: ReactNode }) {
  function trackQualifiedIntake(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const plan = data.get("plan");
    track("security_audit_intake_submitted", {
      plan: typeof plan === "string" ? plan : "unknown",
    });
  }

  return (
    <form
      className="audit-intake-form"
      action="/api/security-audit/checkout"
      method="post"
      onSubmit={trackQualifiedIntake}
    >
      {children}
    </form>
  );
}

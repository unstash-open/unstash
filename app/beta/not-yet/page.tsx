import type { Metadata } from "next";
import { BetaOutcome } from "../BetaOutcome";

export const metadata: Metadata = {
  title: "Beta signal received",
  robots: { index: false, follow: true },
};

export default function NotYetOutcomePage() {
  return (
    <BetaOutcome
      eyebrow="Signal recorded · not yet"
      title="Useful answer. The loop did not earn its place yet."
      copy="That is more valuable than polite praise. If you have another minute, the first confusing or unnecessary step will tell us what to remove or change."
      nextHref="/beta"
      nextLabel="Review the test"
    />
  );
}

import type { Metadata } from "next";
import { BetaOutcome } from "../BetaOutcome";

export const metadata: Metadata = {
  title: "Privacy concern recorded",
  robots: { index: false, follow: true },
};

export default function PrivacyOutcomePage() {
  return (
    <BetaOutcome
      eyebrow="Signal recorded · privacy concern"
      title="Privacy friction is product friction."
      copy="The queue remains local and the test sends no saved-link data. The concern still matters—especially whether activeTab feels acceptable or CSV-only feels safer."
      nextHref="/extension"
      nextLabel="Review the permission model"
    />
  );
}

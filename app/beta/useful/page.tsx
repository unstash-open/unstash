import type { Metadata } from "next";
import { BetaOutcome } from "../BetaOutcome";

export const metadata: Metadata = {
  title: "Beta signal received",
  robots: { index: false, follow: true },
};

export default function UsefulOutcomePage() {
  return (
    <BetaOutcome
      eyebrow="Signal recorded · useful"
      title="That is the signal Unstash needs."
      copy="A forgotten save became worth acting on. The next useful test is whether the same loop still feels calm and clear on a second real save."
      nextHref="/beta/run"
      nextLabel="Try a second save"
    />
  );
}

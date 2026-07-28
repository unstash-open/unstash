"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { PROJECT, explorerUrls, walletsConfigured } from "../../lib/project";

type FundResponse = {
  amount: number;
  goal: number;
  transactionCount: number;
  status: "live" | "partial" | "unavailable";
  updatedAt: string;
  breakdown?: {
    trc20: { amount: number; transactionCount: number; available: boolean };
    erc20: { amount: number; transactionCount: number; available: boolean };
  };
};

const fallback: FundResponse = {
  amount: 0,
  goal: PROJECT.goalUsdt,
  transactionCount: 0,
  status: "unavailable",
  updatedAt: PROJECT.launchAt,
};

export function DonationPanel() {
  const [fund, setFund] = useState<FundResponse>(fallback);
  const [copied, setCopied] = useState<"trc20" | "erc20" | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(
    PROJECT.suggestedContributions[0],
  );

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const response = await fetch("/api/funds", { cache: "no-store" });
        if (!response.ok) throw new Error("Fund endpoint unavailable");
        const next = (await response.json()) as FundResponse;
        if (active) setFund(next);
      } catch {
        if (active) {
          setFund((current) => ({ ...current, status: "unavailable" }));
        }
      }
    };

    void refresh();
    const interval = window.setInterval(refresh, 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const percent = useMemo(
    () =>
      Math.min(
        100,
        Math.max(
          0,
          (fund.amount / PROJECT.activeMilestone.goalUsdt) * 100,
        ),
      ),
    [fund.amount],
  );

  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(fund.amount);

  const copyWallet = async (network: "trc20" | "erc20") => {
    if (!walletsConfigured[network]) return;
    await navigator.clipboard.writeText(PROJECT.wallets[network]);
    setCopied(network);
    window.setTimeout(() => setCopied(null), 1800);
  };

  const statusCopy =
    fund.status === "live"
      ? `${fund.transactionCount} confirmed contribution${fund.transactionCount === 1 ? "" : "s"}`
      : fund.status === "partial"
        ? "One network is temporarily resyncing"
        : "Chain sync is retrying";

  return (
    <aside className="donation-panel" aria-label="Campaign funding progress">
      <div className="donation-top">
        <div className="donation-label-row">
          <span>Milestone 01 · Reddit import</span>
          <span className="chain-pill">ACTIVE · 500 USDT</span>
        </div>
        <div className="fund-total">
          <strong>{formatted}</strong>
          <span>/ {PROJECT.activeMilestone.goalUsdt}</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={fund.amount}
          aria-valuemin={0}
          aria-valuemax={PROJECT.activeMilestone.goalUsdt}
          aria-label={`${formatted} USDT raised of ${PROJECT.activeMilestone.goalUsdt}`}
        >
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="progress-meta">
          <span>{percent.toFixed(1)}% funded</span>
          <span>Stretch roadmap: 10K USDT</span>
        </div>
        <p className="milestone-delivery-copy">
          {PROJECT.activeMilestone.deliveryTarget}
        </p>
        <div className="support-amounts" aria-label="Suggested contribution amount">
          <span>Choose an amount</span>
          <div>
            {PROJECT.suggestedContributions.map((amount) => (
              <button
                aria-pressed={selectedAmount === amount}
                className={selectedAmount === amount ? "selected" : ""}
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                type="button"
              >
                {amount} USDT
              </button>
            ))}
          </div>
          <p>
            Suggested: <strong>{selectedAmount} USDT</strong>. Scan or copy one
            address below, then enter this amount in your wallet.
          </p>
        </div>
      </div>
      <div className="wallet-box">
        <label>Public campaign wallets · address-only QR codes</label>
        <div className="wallet-option">
          <div className="wallet-network">
            <strong>TRON</strong>
            <span>USDT · TRC20</span>
          </div>
          <div className="wallet-content">
            <Image
              alt="QR code for the Unstash TRC20 campaign address"
              className="wallet-qr"
              height={112}
              src="/trc20-qr.png"
              width={112}
            />
            <div>
              <div className="wallet-row">
                <div
                  className="wallet-address"
                  id="wallet-address-trc20"
                  title={PROJECT.wallets.trc20}
                >
                  {PROJECT.wallets.trc20}
                </div>
                <button
                  className="copy-button"
                  disabled={!walletsConfigured.trc20}
                  type="button"
                  onClick={() => copyWallet("trc20")}
                >
                  {copied === "trc20" ? "Copied" : "Copy"}
                </button>
              </div>
              <a className="wallet-explorer" href={explorerUrls.trc20} target="_blank" rel="noreferrer">
                Verify TRC20 wallet ↗
              </a>
            </div>
          </div>
        </div>
        <div className="wallet-option">
          <div className="wallet-network">
            <strong>ETHEREUM</strong>
            <span>USDT · ERC20</span>
          </div>
          <div className="wallet-content">
            <Image
              alt="QR code for the Unstash ERC20 campaign address"
              className="wallet-qr"
              height={112}
              src="/erc20-qr.png"
              width={112}
            />
            <div>
              <div className="wallet-row">
                <div
                  className="wallet-address"
                  id="wallet-address-erc20"
                  title={PROJECT.wallets.erc20}
                >
                  {PROJECT.wallets.erc20}
                </div>
                <button
                  className="copy-button"
                  disabled={!walletsConfigured.erc20}
                  type="button"
                  onClick={() => copyWallet("erc20")}
                >
                  {copied === "erc20" ? "Copied" : "Copy"}
                </button>
              </div>
              <a className="wallet-explorer" href={explorerUrls.erc20} target="_blank" rel="noreferrer">
                Verify ERC20 wallet ↗
              </a>
            </div>
          </div>
        </div>
        <p className="wallet-warning">
          Each QR code contains only the public address. Match it to the exact
          network and send USDT only—TRC20 to TRON or ERC20 to Ethereum. A wrong
          asset or network may be permanently lost.
        </p>
        <div className="chain-status">
          <span>{statusCopy}</span>
          <span>Cutoff: Jul 23, 2026 · 14:26 UTC</span>
        </div>
      </div>
    </aside>
  );
}

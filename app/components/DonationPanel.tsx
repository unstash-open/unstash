"use client";

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
    () => Math.min(100, Math.max(0, (fund.amount / PROJECT.goalUsdt) * 100)),
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
          <span>Funding progress</span>
          <span className="chain-pill">USDT · 2 networks</span>
        </div>
        <div className="fund-total">
          <strong>{formatted}</strong>
          <span>/ 10,000</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={fund.amount}
          aria-valuemin={0}
          aria-valuemax={PROJECT.goalUsdt}
          aria-label={`${formatted} USDT raised of 10,000`}
        >
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="progress-meta">
          <span>{percent.toFixed(1)}% funded</span>
          <span>Goal: 10K USDT</span>
        </div>
      </div>
      <div className="wallet-box">
        <label>Public campaign wallets</label>
        <div className="wallet-option">
          <div className="wallet-network">
            <strong>TRON</strong>
            <span>USDT · TRC20</span>
          </div>
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
        <div className="wallet-option">
          <div className="wallet-network">
            <strong>ETHEREUM</strong>
            <span>USDT · ERC20</span>
          </div>
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
        <p className="wallet-warning">
          Match the address to its exact network. Send USDT only—TRC20 to the
          TRON address or ERC20 to the Ethereum address. A wrong asset or network
          may be permanently lost.
        </p>
        <div className="chain-status">
          <span>{statusCopy}</span>
          <span>Cutoff: Jul 23, 2026 · 14:26 UTC</span>
        </div>
      </div>
    </aside>
  );
}

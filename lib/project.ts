export const PROJECT = {
  name: "Unstash",
  siteUrl: "https://unstash-open.vercel.app",
  releaseUrl: "https://github.com/unstash-open/unstash/releases/tag/v0.1.0",
  goalUsdt: 10_000,
  activeMilestone: {
    id: "extension-hardening",
    title: "Extension 0.1 hardening",
    goalUsdt: 500,
    deliveryTarget:
      "The Chromium developer preview is live. A tested cross-browser release ships within 7 days after the milestone is funded.",
  },
  suggestedContributions: [10, 25, 100],
  launchAt: "2026-07-23T14:26:45.000Z",
  wallets: {
    trc20: "TJcZKX3LvhoLnLRmdT3sPff1qs5cNtLZT8",
    erc20: "0xE8c7c466Bb526ab022667403229A2730E803ef57",
  },
  contracts: {
    trc20Usdt: "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj",
    erc20Usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  ethereumLaunchBlock: "0x1869072",
  sourceUrl: "https://github.com/unstash-open/unstash",
  feedbackUrl:
    "https://github.com/unstash-open/unstash/issues/new?title=%5BBeta%20feedback%5D%20&body=What%20I%20tried%3A%20%0A%0AThe%20first%20confusing%20or%20broken%20thing%3A%20%0A%0AI%20would%20prefer%3A%20activeTab%20%2F%20CSV-only%20%2F%20not%20sure%0A%0APlease%20do%20not%20include%20private%20links%20or%20personal%20data.",
} as const;

export const walletsConfigured = {
  trc20: /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(PROJECT.wallets.trc20),
  erc20: /^0x[a-fA-F0-9]{40}$/.test(PROJECT.wallets.erc20),
};

export const explorerUrls = {
  trc20: `https://tronscan.org/#/address/${PROJECT.wallets.trc20}/transfers`,
  erc20: `https://etherscan.io/address/${PROJECT.wallets.erc20}#tokentxns`,
};

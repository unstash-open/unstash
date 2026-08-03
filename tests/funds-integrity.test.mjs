import assert from "node:assert/strict";
import test from "node:test";

import {
  isOfficialEthereumUsdtTransfer,
  isOfficialTronUsdtTransfer,
  sumMicroUsdt,
} from "../lib/funds.js";

const project = {
  launchAt: "2026-07-23T14:26:45.000Z",
  ethereumLaunchBlock: "0x1869072",
  wallets: {
    trc20: "TJcZKX3LvhoLnLRmdT3sPff1qs5cNtLZT8",
    erc20: "0xE8c7c466Bb526ab022667403229A2730E803ef57",
  },
  contracts: {
    trc20Usdt: "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj",
    erc20Usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
};

test("rejects a counterfeit ERC-20 named USDT", () => {
  const counterfeit = {
    block_number: 99_999_999,
    timestamp: "2026-08-03T00:00:00.000Z",
    to: { hash: project.wallets.erc20 },
    token: {
      address_hash: "0x1111111111111111111111111111111111111111",
      decimals: "6",
      symbol: "USDT",
    },
    total: { value: "999999999999" },
  };

  assert.equal(isOfficialEthereumUsdtTransfer(counterfeit, project), false);
});

test("accepts only official in-window USDT transfers", () => {
  const officialEthereum = {
    block_number: 99_999_999,
    timestamp: "2026-08-03T00:00:00.000Z",
    to: { hash: project.wallets.erc20.toLowerCase() },
    token: {
      address_hash: project.contracts.erc20Usdt,
      decimals: "6",
      symbol: "USDT",
    },
    total: { value: "2500000" },
  };
  const officialTron = {
    to: project.wallets.trc20,
    token_info: {
      address: project.contracts.trc20Usdt,
      decimals: 6,
      symbol: "USDT",
    },
    value: "1500000",
  };

  assert.equal(isOfficialEthereumUsdtTransfer(officialEthereum, project), true);
  assert.equal(isOfficialTronUsdtTransfer(officialTron, project), true);
  assert.equal(sumMicroUsdt([officialEthereum.total.value, officialTron.value]), 4);
});

test("rejects wrong decimals, recipients, malformed amounts and pre-launch transfers", () => {
  const base = {
    block_number: 99_999_999,
    timestamp: "2026-08-03T00:00:00.000Z",
    to: { hash: project.wallets.erc20 },
    token: { address_hash: project.contracts.erc20Usdt, decimals: "6" },
    total: { value: "1000000" },
  };

  assert.equal(isOfficialEthereumUsdtTransfer({ ...base, token: { ...base.token, decimals: "18" } }, project), false);
  assert.equal(isOfficialEthereumUsdtTransfer({ ...base, to: { hash: "0x0000000000000000000000000000000000000000" } }, project), false);
  assert.equal(isOfficialEthereumUsdtTransfer({ ...base, total: { value: "1e6" } }, project), false);
  assert.equal(isOfficialEthereumUsdtTransfer({ ...base, timestamp: "2026-07-01T00:00:00.000Z" }, project), false);
});

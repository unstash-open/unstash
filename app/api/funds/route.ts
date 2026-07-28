import { PROJECT } from "../../../lib/project";

export const runtime = "nodejs";

type TronTransfer = {
  transaction_id: string;
  block_timestamp: number;
  from: string;
  to: string;
  value: string;
  token_info?: {
    address?: string;
    decimals?: number;
    symbol?: string;
  };
};

type TronResponse = {
  data?: TronTransfer[];
  meta?: {
    fingerprint?: string;
  };
};

type BlockscoutTransfer = {
  block_number: number;
  timestamp: string;
  transaction_hash: string;
  to?: { hash?: string };
  token?: {
    address_hash?: string;
    decimals?: string;
    symbol?: string;
  };
  total?: {
    decimals?: string;
    value?: string;
  };
};

type BlockscoutResponse = {
  items?: BlockscoutTransfer[];
  next_page_params?: Record<string, string | number> | null;
};

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function fetchTronTotal() {
  const transfers: TronTransfer[] = [];
  let fingerprint: string | undefined;

  for (let page = 0; page < 10; page += 1) {
    const params = new URLSearchParams({
      only_confirmed: "true",
      only_to: "true",
      limit: "200",
      order_by: "block_timestamp,desc",
      contract_address: PROJECT.contracts.trc20Usdt,
      min_timestamp: String(Date.parse(PROJECT.launchAt)),
    });

    if (fingerprint) params.set("fingerprint", fingerprint);

    const response = await fetch(
      `https://api.trongrid.io/v1/accounts/${PROJECT.wallets.trc20}/transactions/trc20?${params}`,
      {
        headers: { Accept: "application/json" },
        cf: { cacheTtl: 60, cacheEverything: true },
      } as RequestInit,
    );

    if (!response.ok) {
      throw new Error(`TronGrid responded with ${response.status}`);
    }

    const payload = (await response.json()) as TronResponse;
    const pageTransfers = payload.data ?? [];
    transfers.push(...pageTransfers);
    fingerprint = payload.meta?.fingerprint;

    if (!fingerprint || pageTransfers.length < 200) break;
  }

  const valid = transfers.filter((transfer) => {
    const contractMatches =
      transfer.token_info?.address?.toLowerCase() ===
      PROJECT.contracts.trc20Usdt.toLowerCase();
    const tokenMatches = transfer.token_info?.symbol === "USDT";
    const recipientMatches = transfer.to === PROJECT.wallets.trc20;
    return recipientMatches && (contractMatches || tokenMatches);
  });

  const microUsdt = valid.reduce((sum, transfer) => {
    if (!/^\d+$/.test(transfer.value)) return sum;
    return sum + BigInt(transfer.value);
  }, 0n);

  return {
    amount: Number(microUsdt) / 1_000_000,
    transactionCount: valid.length,
  };
}

async function fetchEthereumTotal() {
  const transfers: BlockscoutTransfer[] = [];
  let nextPage: Record<string, string | number> | null | undefined;

  for (let page = 0; page < 10; page += 1) {
    const params = new URLSearchParams({ type: "ERC-20", filter: "to" });
    for (const [key, value] of Object.entries(nextPage ?? {})) {
      params.set(key, String(value));
    }

    const response = await fetch(
      `https://eth.blockscout.com/api/v2/addresses/${PROJECT.wallets.erc20}/token-transfers?${params}`,
      { headers: { Accept: "application/json" } },
    );

    if (!response.ok) {
      throw new Error(`Blockscout responded with ${response.status}`);
    }

    const payload = (await response.json()) as BlockscoutResponse;
    const pageTransfers = payload.items ?? [];
    transfers.push(...pageTransfers);
    nextPage = payload.next_page_params;

    const reachedLaunch =
      pageTransfers.some(
        (transfer) =>
          transfer.block_number < Number(BigInt(PROJECT.ethereumLaunchBlock)) ||
          Date.parse(transfer.timestamp) < Date.parse(PROJECT.launchAt),
      );
    if (!nextPage || reachedLaunch) break;
  }

  const valid = transfers.filter((transfer) => {
    const tokenMatches =
      transfer.token?.address_hash?.toLowerCase() ===
        PROJECT.contracts.erc20Usdt.toLowerCase() ||
      transfer.token?.symbol === "USDT";
    const recipientMatches =
      transfer.to?.hash?.toLowerCase() === PROJECT.wallets.erc20.toLowerCase();
    const afterLaunch =
      transfer.block_number >= Number(BigInt(PROJECT.ethereumLaunchBlock)) &&
      Date.parse(transfer.timestamp) >= Date.parse(PROJECT.launchAt);
    return recipientMatches && tokenMatches && afterLaunch;
  });

  const microUsdt = valid.reduce((sum, transfer) => {
    const value = transfer.total?.value;
    if (!value || !/^\d+$/.test(value)) return sum;
    return sum + BigInt(value);
  }, 0n);

  return {
    amount: Number(microUsdt) / 1_000_000,
    transactionCount: new Set(valid.map((transfer) => transfer.transaction_hash)).size,
  };
}

export async function GET() {
  const [trc20Result, erc20Result] = await Promise.allSettled([
    fetchTronTotal(),
    fetchEthereumTotal(),
  ]);

  const trc20 =
    trc20Result.status === "fulfilled"
      ? { ...trc20Result.value, available: true }
      : { amount: 0, transactionCount: 0, available: false };
  const erc20 =
    erc20Result.status === "fulfilled"
      ? { ...erc20Result.value, available: true }
      : { amount: 0, transactionCount: 0, available: false };
  const availableCount = Number(trc20.available) + Number(erc20.available);

  return json(
    {
      status: availableCount === 2 ? "live" : availableCount === 1 ? "partial" : "unavailable",
      amount: trc20.amount + erc20.amount,
      goal: PROJECT.activeMilestone.goalUsdt,
      stretchGoal: PROJECT.goalUsdt,
      transactionCount: trc20.transactionCount + erc20.transactionCount,
      breakdown: { trc20, erc20 },
      updatedAt: new Date().toISOString(),
      cutoff: PROJECT.launchAt,
    },
    availableCount === 0 ? 503 : 200,
  );
}

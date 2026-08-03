const USDT_DECIMALS = 6;
const MICRO_USDT = 10 ** USDT_DECIMALS;

function isDigitString(value) {
  return typeof value === "string" && /^\d+$/.test(value);
}

function decimalsMatch(value) {
  return value == null || String(value) === String(USDT_DECIMALS);
}

/**
 * Accept a TRON transfer only when the official token contract and recipient
 * both match. Token symbols are display metadata and are not an identity.
 */
export function isOfficialTronUsdtTransfer(transfer, project) {
  return (
    transfer?.token_info?.address?.toLowerCase() === project.contracts.trc20Usdt.toLowerCase() &&
    decimalsMatch(transfer?.token_info?.decimals) &&
    transfer?.to === project.wallets.trc20 &&
    isDigitString(transfer?.value)
  );
}

/**
 * Accept an Ethereum transfer only when its contract, recipient and campaign
 * window match. A counterfeit token named USDT must never affect the total.
 */
export function isOfficialEthereumUsdtTransfer(transfer, project) {
  const timestamp = Date.parse(transfer?.timestamp ?? "");
  return (
    transfer?.token?.address_hash?.toLowerCase() === project.contracts.erc20Usdt.toLowerCase() &&
    decimalsMatch(transfer?.token?.decimals) &&
    transfer?.to?.hash?.toLowerCase() === project.wallets.erc20.toLowerCase() &&
    Number.isFinite(timestamp) &&
    transfer?.block_number >= Number(BigInt(project.ethereumLaunchBlock)) &&
    timestamp >= Date.parse(project.launchAt) &&
    isDigitString(transfer?.total?.value)
  );
}

export function sumMicroUsdt(values) {
  const microUsdt = values.reduce(
    (sum, value) => (isDigitString(value) ? sum + BigInt(value) : sum),
    0n,
  );
  return Number(microUsdt) / MICRO_USDT;
}

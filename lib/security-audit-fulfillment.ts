export class FulfillmentConfigurationError extends Error {}

export type FulfillmentConfiguration = {
  url: URL;
  secret: string;
};

export function getFulfillmentConfiguration(): FulfillmentConfiguration {
  const target = process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_URL?.trim();
  if (!target) {
    throw new FulfillmentConfigurationError("Fulfillment webhook is not configured.");
  }

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    throw new FulfillmentConfigurationError("Fulfillment webhook URL is invalid.");
  }

  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new FulfillmentConfigurationError("Fulfillment webhook must use HTTPS.");
  }
  if (url.username || url.password || url.hash) {
    throw new FulfillmentConfigurationError(
      "Fulfillment webhook URL must not contain credentials or a fragment.",
    );
  }

  const secret = process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new FulfillmentConfigurationError(
      "Fulfillment webhook secret must contain at least 32 characters.",
    );
  }

  return { url, secret };
}

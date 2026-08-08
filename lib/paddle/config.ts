/**
 * Live Sumvora Pro price (Paddle Catalog).
 * Public price IDs are safe in client bundles; never put API/webhook secrets here.
 */
export const SUMVORA_PRO_PRICE_ID =
  process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID?.trim() ||
  "pri_01kytjr1qscdmybt6hpczg7w9c";

/** Where Paddle redirects after a successful overlay checkout. */
export function getCheckoutSuccessUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/account`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (siteUrl) {
    return `${siteUrl}/account`;
  }

  return "https://sumvora-app.vercel.app/account";
}

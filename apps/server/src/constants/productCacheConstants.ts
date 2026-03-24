const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;

function envPositiveNumber(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Default max age before a cached product is re-fetched (lazy SWR). */
export const PRODUCT_CACHE_MAX_AGE_MS =
  envPositiveNumber('PRODUCT_CACHE_MAX_AGE_DAYS', 14) * MS_PER_DAY;

/**
 * When `expiryDate` is within this many days (before or after today), use the
 * shorter near-expiry max age instead of the default.
 */
export const PRODUCT_CACHE_NEAR_EXPIRY_WINDOW_MS =
  envPositiveNumber('PRODUCT_CACHE_NEAR_EXPIRY_WINDOW_DAYS', 30) * MS_PER_DAY;

/** Max cache age for rows in the near-expiry window (tighter refresh). */
export const PRODUCT_CACHE_NEAR_EXPIRY_MAX_AGE_MS =
  envPositiveNumber('PRODUCT_CACHE_NEAR_EXPIRY_MAX_AGE_HOURS', 24) *
  MS_PER_HOUR;

export type ProductCacheDoc = {
  updatedAt?: Date | null;
  expiryDate: Date | null;
};

export function isProductCacheStale(
  doc: ProductCacheDoc,
  nowMs: number = Date.now(),
): boolean {
  const updated = doc.updatedAt;
  const updatedMs =
    updated instanceof Date && !Number.isNaN(updated.getTime())
      ? updated.getTime()
      : 0;

  const expiry = doc.expiryDate;
  let nearExpiry = false;
  if (
    expiry instanceof Date &&
    !Number.isNaN(expiry.getTime()) &&
    expiry.getTime() - nowMs <= PRODUCT_CACHE_NEAR_EXPIRY_WINDOW_MS
  ) {
    nearExpiry = true;
  }

  const maxAge = nearExpiry
    ? PRODUCT_CACHE_NEAR_EXPIRY_MAX_AGE_MS
    : PRODUCT_CACHE_MAX_AGE_MS;

  return nowMs - updatedMs > maxAge;
}

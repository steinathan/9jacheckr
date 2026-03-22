/** Combined monthly API usage cap for Free (verifies only; search is Pro-only). */
export const API_FREE_MONTHLY_LIMIT = 300;
/**
 * Monthly cap for **combined** API usage: each single/batch verify row (success or not-found)
 * plus each successful `GET /api/products/search` response counts as one unit.
 * Keep pricing in sync with `initializeApiProTransaction` amount.
 */
export const API_PRO_MONTHLY_LIMIT = 50_000;
export const BOT_FREE_DAILY_LIMIT = 5;
export const PRO_MAX_API_KEYS = 8;

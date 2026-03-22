import { rateLimit } from 'express-rate-limit';

const limitBody = {
  ok: false,
  code: 'RATE_LIMITED',
  message: 'Too many requests. Please wait a moment and try again.',
} as const;

const window15m = 15 * 60 * 1000;

/**
 * Dashboard session routes (`/api/keys/*`): keys, metrics, billing.
 * High ceiling per IP — not the same bucket as verify/search plan limits.
 */
export const dashboardKeysRateLimiter = rateLimit({
  windowMs: window15m,
  limit: 3000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitBody,
});

/** Internal Telegram bot → API (typically one egress IP). */
export const botRoutesRateLimiter = rateLimit({
  windowMs: window15m,
  limit: 8000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitBody,
});

/** Next.js BFF `GET /api/public/verify/:nafdac` (shared secret). */
export const publicVerifyRateLimiter = rateLimit({
  windowMs: window15m,
  limit: 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitBody,
});

import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

function key(req: Request): string {
  const body = (req.body ?? {}) as { telegramId?: unknown };
  const tg = typeof body.telegramId === 'string' ? body.telegramId.trim() : '';
  const ip = req.ip ?? 'unknown';
  return tg ? `bot-init:${tg}:${ip}` : `bot-init:${ip}`;
}

export const botBillingInitializeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => key(req),
  message: { ok: false, code: 'RATE_LIMITED', message: 'Too many requests.' },
});

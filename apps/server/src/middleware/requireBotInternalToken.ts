import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export function requireBotInternalToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.header('x-internal-bot-token') ?? '';
  const expected = process.env.BOT_INTERNAL_TOKEN ?? '';

  if (!expected) {
    res.status(401).json({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Invalid bot token',
    });
    return;
  }

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(token, 'utf8');
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!ok) {
    res.status(401).json({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Invalid bot token',
    });
    return;
  }

  next();
}

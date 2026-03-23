import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/** If `HEALTH_SECRET` is set, require `x-health-secret` (timing-safe). Otherwise no-op. */
export function requireHealthSecret(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const expected = process.env.HEALTH_SECRET?.trim();
  if (!expected) {
    next();
    return;
  }
  const got = req.header('x-health-secret') ?? '';
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(got, 'utf8');
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) {
    res.status(401).json({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Invalid or missing health secret.',
    });
    return;
  }
  next();
}

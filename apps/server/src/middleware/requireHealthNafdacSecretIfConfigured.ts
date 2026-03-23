import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export function requireHealthNafdacSecretIfConfigured(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const expected = process.env.HEALTH_NAFDAC_SECRET?.trim();
  if (!expected) {
    next();
    return;
  }
  const got = req.header('x-health-nafdac-secret') ?? '';
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

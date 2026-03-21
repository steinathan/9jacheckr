import type { Request, Response, NextFunction } from 'express';
import type { VerifyApiErrorBody, VerifyApiSuccess } from '../types/types.js';
import { getOrFetchProduct } from '../services/verifyService.js';
import { logger } from '../utils/logger.js';

/**
 * Verify for the marketing site, gated by WEB_VERIFY_INTERNAL_SECRET (BFF only).
 * Browsers call Next.js `/api/verify-lookup`; this route is not for direct clients.
 * Does not increment API-key usage metrics.
 */
export async function publicVerifyController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const rawParam = req.params.nafdac;
    const raw = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    if (!raw?.trim()) {
      const body: VerifyApiErrorBody = {
        ok: false,
        code: 'INVALID_NAFDAC',
        message: 'Enter a NAFDAC registration number.',
      };
      res.status(400).json(body);
      return;
    }

    logger.info('publicVerifyController request', { nafdac: raw });

    const product = await getOrFetchProduct(raw);
    if (!product) {
      const body: VerifyApiErrorBody = {
        ok: false,
        code: 'NOT_FOUND',
        message: 'No product found for this number on the NAFDAC register.',
      };
      res.status(404).json(body);
      return;
    }

    const body: VerifyApiSuccess = { ok: true, product };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

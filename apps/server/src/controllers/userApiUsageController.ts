import type { Request, Response } from 'express';
import { getUsageForUser } from '../services/userApiUsageService.js';

export async function getMyUsageMetrics(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const metrics = await getUsageForUser(userId);
  res.status(200).json({
    ok: true,
    metrics: {
      ...metrics,
      lastVerifyAt: metrics.lastVerifyAt
        ? metrics.lastVerifyAt.toISOString()
        : null,
    },
  });
}

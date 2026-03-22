import type { Request, Response } from 'express';
import {
  botProMonthlyKobo,
  botProPrepayMaxMonths,
} from '../services/botProPrepay.js';
import { getBotStatusSnapshot } from '../services/botPlanService.js';
import { parseBotTelegramId } from '../utils/botTelegramId.js';

export async function botStatusController(req: Request, res: Response) {
  const body = (req.body ?? {}) as { telegramId?: unknown };
  const telegramId = parseBotTelegramId(body.telegramId);
  if (!telegramId) {
    res.status(400).json({
      ok: false,
      message: 'telegramId must be a numeric Telegram user id.',
    });
    return;
  }

  try {
    const snapshot = await getBotStatusSnapshot(telegramId);
    res.json({
      ok: true,
      ...snapshot,
      prepayMonthlyKobo: botProMonthlyKobo(),
      prepayMaxMonths: botProPrepayMaxMonths(),
    });
  } catch {
    res.status(500).json({ ok: false, message: 'Could not load status.' });
  }
}

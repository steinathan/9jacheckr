import type { Request, Response } from 'express';
import type { BotActivityRequestBody } from '../types/types.js';
import { recordBotStart } from '../services/botMetricsService.js';
import { parseBotTelegramId } from '../utils/botTelegramId.js';

export async function postBotActivityController(req: Request, res: Response) {
  const body = req.body as BotActivityRequestBody;
  const telegramId = parseBotTelegramId(body.telegramId);

  if (body.event !== 'start' || !telegramId) {
    res.status(400).json({
      ok: false,
      code: 'INVALID_BODY',
      message: 'event=start and valid numeric telegramId required',
    });
    return;
  }

  await recordBotStart({
    id: telegramId,
    username: body.username?.trim() || undefined,
    firstName: body.firstName?.trim() || undefined,
    lastName: body.lastName?.trim() || undefined,
  });

  res.json({ ok: true });
}

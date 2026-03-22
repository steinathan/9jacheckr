import type { Request, Response } from 'express';
import { listTelegramBotBillingPayments } from '../services/botBillingPaymentService.js';
import { parseBotTelegramId } from '../utils/botTelegramId.js';

export async function botBillingTransactionsController(
  req: Request,
  res: Response,
) {
  const body = (req.body ?? {}) as {
    telegramId?: unknown;
    page?: unknown;
    perPage?: unknown;
  };
  const telegramId = parseBotTelegramId(body.telegramId);
  if (!telegramId) {
    res.status(400).json({
      ok: false,
      message: 'telegramId must be a numeric Telegram user id.',
    });
    return;
  }

  const pageRaw = body.page;
  const perPageRaw = body.perPage;
  const page =
    typeof pageRaw === 'number' && Number.isFinite(pageRaw)
      ? Math.floor(pageRaw)
      : 1;
  const perPage =
    typeof perPageRaw === 'number' && Number.isFinite(perPageRaw)
      ? Math.floor(perPageRaw)
      : 20;

  try {
    const { transactions, meta } = await listTelegramBotBillingPayments({
      telegramId,
      page,
      perPage,
    });
    res.json({ ok: true, transactions, meta });
  } catch {
    res.status(500).json({ ok: false, message: 'Could not load payments.' });
  }
}

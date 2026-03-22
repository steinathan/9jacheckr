import { BotBillingPaymentModel } from '../models/botBillingPaymentModel.js';
import { BotSubscriptionModel } from '../models/botSubscriptionModel.js';
import {
  computePrepayPeriodEnd,
  expectedBotPrepayTotalKobo,
  isValidPrepayMonths,
  readPrepayMonthsFromChargeData,
} from './botProPrepay.js';
import { logger } from '../utils/logger.js';
import {
  pickAmount,
  pickChannel,
  pickCurrency,
  pickDescription,
  pickPaidAt,
  pickReference,
} from './apiBillingPaymentService.js';
import type { BillingPaymentRow } from './apiBillingPaymentService.js';

export async function recordBotProPaymentFromWebhook(params: {
  telegramId: string;
  event: string;
  d: Record<string, unknown>;
  months?: number | null;
}): Promise<void> {
  const ref = pickReference(params.d);
  if (!ref) {
    logger.debug('BotBillingPayment: skip (no reference)', {
      event: params.event,
    });
    return;
  }
  const amount = pickAmount(params.d);
  if (amount == null) {
    logger.debug('BotBillingPayment: skip (no amount)', {
      event: params.event,
      reference: ref,
    });
    return;
  }

  const setDoc: Record<string, unknown> = {
    telegramId: params.telegramId,
    amountKobo: amount,
    currency: pickCurrency(params.d),
    status: 'success',
    channel: pickChannel(params.d),
    paidAt: pickPaidAt(params.d),
    description: pickDescription(params.d),
    sourceEvent: params.event,
  };
  if (params.months != null) setDoc.months = params.months;

  await BotBillingPaymentModel.updateOne(
    { paystackReference: ref },
    { $set: setDoc },
    { upsert: true },
  );
}

export async function processBotProPrepayChargeSuccess(params: {
  telegramId: string;
  event: string;
  d: Record<string, unknown>;
}): Promise<void> {
  const ref = pickReference(params.d);
  if (!ref) {
    logger.warn('Bot prepay: no reference', { event: params.event });
    return;
  }
  const amount = pickAmount(params.d);
  if (amount == null) {
    logger.warn('Bot prepay: no amount', { reference: ref });
    return;
  }
  const currency = pickCurrency(params.d).toUpperCase();
  if (currency !== 'NGN') {
    logger.warn('Bot prepay: wrong currency', { reference: ref, currency });
    return;
  }

  const months = readPrepayMonthsFromChargeData(params.d);
  if (months == null || !isValidPrepayMonths(months)) {
    logger.warn('Bot prepay: invalid months in metadata', {
      reference: ref,
      months,
    });
    return;
  }

  const expected = expectedBotPrepayTotalKobo(months);
  if (amount !== expected) {
    logger.warn('Bot prepay: amount mismatch', {
      reference: ref,
      amount,
      expected,
      months,
    });
    return;
  }

  await recordBotProPaymentFromWebhook({
    telegramId: params.telegramId,
    event: params.event,
    d: params.d,
    months,
  });

  const prior = await BotBillingPaymentModel.findOneAndUpdate(
    {
      paystackReference: ref,
      $or: [
        { extensionAppliedAt: { $exists: false } },
        { extensionAppliedAt: null },
      ],
    },
    { $set: { extensionAppliedAt: new Date() } },
    { new: false },
  );

  if (!prior) {
    logger.debug('Bot prepay: skip extend (already applied or missing row)', {
      reference: ref,
    });
    return;
  }

  try {
    const now = new Date();
    const sub = await BotSubscriptionModel.findOne({
      telegramId: params.telegramId,
    }).lean();
    const existingEnd =
      sub?.currentPeriodEnd instanceof Date ? sub.currentPeriodEnd : null;
    const newEnd = computePrepayPeriodEnd({
      existingEnd,
      months,
      now,
    });

    await BotSubscriptionModel.findOneAndUpdate(
      { telegramId: params.telegramId },
      {
        $set: {
          plan: 'pro_bot',
          status: 'active',
          currentPeriodEnd: newEnd,
          paystackSubscriptionCode: null,
        },
      },
      { upsert: true },
    );
    logger.info('Bot prepay: extended Pro', {
      telegramId: params.telegramId,
      reference: ref,
      months,
      newEnd: newEnd.toISOString(),
    });
  } catch (e) {
    await BotBillingPaymentModel.updateOne(
      { paystackReference: ref },
      { $unset: { extensionAppliedAt: 1 } },
    );
    logger.error('Bot prepay: extend failed, rolled back claim', {
      reference: ref,
      message: String(e),
    });
    throw e;
  }
}

export async function listTelegramBotBillingPayments(params: {
  telegramId: string;
  page: number;
  perPage: number;
}): Promise<{
  transactions: BillingPaymentRow[];
  meta: { total: number; page: number; pageCount: number };
}> {
  const perPage = Math.min(50, Math.max(1, params.perPage));
  const page = Math.max(1, params.page);
  const skip = (page - 1) * perPage;

  const filter = { telegramId: params.telegramId };
  const [rows, total] = await Promise.all([
    BotBillingPaymentModel.find(filter)
      .sort({ paidAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    BotBillingPaymentModel.countDocuments(filter),
  ]);

  const transactions: BillingPaymentRow[] = rows.map((r) => ({
    reference: r.paystackReference,
    amountKobo: r.amountKobo,
    currency: r.currency,
    status: r.status,
    paidAt: r.paidAt ? r.paidAt.toISOString() : null,
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
    channel: r.channel,
    description: r.description,
    months:
      typeof r.months === 'number' && Number.isFinite(r.months)
        ? r.months
        : null,
  }));

  return {
    transactions,
    meta: {
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / perPage)),
    },
  };
}

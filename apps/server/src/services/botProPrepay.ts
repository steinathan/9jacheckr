function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

function normalizeMetaObject(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return {};
    try {
      const p = JSON.parse(t) as unknown;
      return asRecord(p) ?? {};
    } catch {
      return {};
    }
  }
  return asRecord(raw) ?? {};
}

const DEFAULT_MONTHLY_KOBO = 100_000;
const DEFAULT_MAX_MONTHS = 24;
const DEFAULT_MAX_END_AHEAD_MONTHS = 36;

export function botProMonthlyKobo(): number {
  const raw = process.env.BOT_PRO_MONTHLY_KOBO?.trim();
  if (!raw) return DEFAULT_MONTHLY_KOBO;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_MONTHLY_KOBO;
}

export function botProPrepayMaxMonths(): number {
  const raw = process.env.BOT_PRO_PREPAY_MAX_MONTHS?.trim();
  if (!raw) return DEFAULT_MAX_MONTHS;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1
    ? Math.min(120, Math.floor(n))
    : DEFAULT_MAX_MONTHS;
}

export function botProPrepayMaxEndAheadMonths(): number {
  const raw = process.env.BOT_PRO_PREPAY_MAX_END_AHEAD_MONTHS?.trim();
  if (!raw) return DEFAULT_MAX_END_AHEAD_MONTHS;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1
    ? Math.min(240, Math.floor(n))
    : DEFAULT_MAX_END_AHEAD_MONTHS;
}

export function expectedBotPrepayTotalKobo(months: number): number {
  return months * botProMonthlyKobo();
}

export function parsePrepayMonths(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    const n = Number.parseInt(raw.trim(), 10);
    if (Number.isInteger(n) && n > 0) return n;
  }
  return null;
}

export function readPrepayMonthsFromChargeData(
  d: Record<string, unknown>,
): number | null {
  const meta = normalizeMetaObject(d.metadata);
  const cust = asRecord(d.customer) ?? {};
  const custMeta = normalizeMetaObject(cust.metadata);
  return parsePrepayMonths(meta.months ?? custMeta.months);
}

export function isValidPrepayMonths(months: number): boolean {
  const max = botProPrepayMaxMonths();
  return Number.isInteger(months) && months >= 1 && months <= max;
}

export function addCalendarMonthsUtc(base: Date, months: number): Date {
  const d = new Date(base.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

export function computePrepayPeriodEnd(params: {
  existingEnd: Date | null;
  months: number;
  now: Date;
}): Date {
  const { existingEnd, months, now } = params;
  const base =
    existingEnd && existingEnd.getTime() > now.getTime() ? existingEnd : now;
  let end = addCalendarMonthsUtc(base, months);
  const cap = addCalendarMonthsUtc(now, botProPrepayMaxEndAheadMonths());
  if (end.getTime() > cap.getTime()) end = cap;
  return end;
}

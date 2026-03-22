import { MonthlyApiUsageModel } from '../models/monthlyApiUsageModel.js';
import { monthlyVerifyLimitForPlan, resolveApiPlan } from './apiPlanService.js';
import type { ResolvedApiPlan } from './apiPlanService.js';

export function currentUtcMonthKey(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export type MonthlyUsageBreakdown = { verify: number; search: number };

export async function getMonthlyUsageBreakdown(
  userId: string,
  periodKey: string,
): Promise<MonthlyUsageBreakdown> {
  const doc = await MonthlyApiUsageModel.findOne({ userId, periodKey }).lean();
  return {
    verify: doc?.verifyCount ?? 0,
    search: doc?.searchCount ?? 0,
  };
}

/** Sum of verify rows and successful search requests this month (quota basis). */
export async function getMonthlyApiUsageTotal(
  userId: string,
  periodKey: string,
): Promise<number> {
  const { verify, search } = await getMonthlyUsageBreakdown(userId, periodKey);
  return verify + search;
}

export async function assertMonthlyApiQuotaAllows(
  userId: string,
): Promise<
  | { ok: true; plan: ResolvedApiPlan; used: number; limit: number }
  | { ok: false; plan: ResolvedApiPlan; used: number; limit: number }
> {
  return assertMonthlyApiQuotaAllowsAdditional(userId, 1);
}

export async function assertMonthlyApiQuotaAllowsAdditional(
  userId: string,
  delta: number,
): Promise<
  | { ok: true; plan: ResolvedApiPlan; used: number; limit: number }
  | { ok: false; plan: ResolvedApiPlan; used: number; limit: number }
> {
  const plan = await resolveApiPlan(userId);
  const limit = monthlyVerifyLimitForPlan(plan);
  const periodKey = currentUtcMonthKey();
  const used = await getMonthlyApiUsageTotal(userId, periodKey);
  if (used + delta > limit) {
    return { ok: false, plan, used, limit };
  }
  return { ok: true, plan, used, limit };
}

export async function incrementMonthlyApiVerify(userId: string): Promise<void> {
  const periodKey = currentUtcMonthKey();
  await MonthlyApiUsageModel.findOneAndUpdate(
    { userId, periodKey },
    { $inc: { verifyCount: 1 }, $setOnInsert: { userId, periodKey } },
    { upsert: true },
  );
}

export async function incrementMonthlyApiSearch(userId: string): Promise<void> {
  const periodKey = currentUtcMonthKey();
  await MonthlyApiUsageModel.findOneAndUpdate(
    { userId, periodKey },
    { $inc: { searchCount: 1 }, $setOnInsert: { userId, periodKey } },
    { upsert: true },
  );
}

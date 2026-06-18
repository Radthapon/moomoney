'use client';
import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { DailyBudget, DailyRolloverDecision, DailySpendingEntry, DailySavingsWithdrawal } from '@/types';

/** Returns 'YYYY-MM-DD' in the local timezone */
export function toDateStr(date: Date = new Date()): string {
  return date.toLocaleDateString('sv-SE');
}

/** Base budget for a date given settings (no rollover, no bonus) */
export function getBaseBudgetForDate(dateStr: string, settings: DailyBudget | undefined): number {
  if (!settings) return 0;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return settings.perMeal * 3 + (settings.transportDays.includes(dow) ? settings.dailyTransport : 0);
}

/**
 * Compute effective budget chain for an entire month.
 * bonusByDate: extra budget injected from savings pool (doesn't roll over itself)
 */
export function computeMonthlyEffectiveBudgets(
  year: number,
  month: number,
  spendingByDate: Record<string, number>,
  rolloverByDate: Record<string, 'save' | 'rollover'>,
  settings: DailyBudget | undefined,
  bonusByDate: Record<string, number> = {},
): Record<string, number> {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  const result: Record<string, number> = {};
  let prevRollover = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    const base = getBaseBudgetForDate(dateStr, settings);
    const bonus = bonusByDate[dateStr] ?? 0;
    const effective = base + prevRollover + bonus;
    result[dateStr] = effective;

    const spent = spendingByDate[dateStr] ?? 0;
    const net = effective - spent;

    if (net < 0) {
      prevRollover = net;
    } else {
      prevRollover = rolloverByDate[dateStr] === 'rollover' ? net : 0;
    }
  }
  return result;
}

/** Entries + actions for one specific day */
export function useDailySpending(date: string) {
  const entries = useLiveQuery<DailySpendingEntry[]>(
    () => db.dailySpendingEntries.where('date').equals(date).toArray(),
    [date],
  );
  const addEntry = (amount: number, note: string) =>
    db.dailySpendingEntries.add({ date, amount, note, createdAt: new Date() });
  const deleteEntry = (id: number) => db.dailySpendingEntries.delete(id);
  const total = (entries ?? []).reduce((s, e) => s + e.amount, 0);
  return { entries: entries ?? [], total, addEntry, deleteEntry };
}

/** Aggregated totals per date for a given month (0-based month) */
export function useMonthlySpending(year: number, month: number) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const entries = useLiveQuery<DailySpendingEntry[]>(
    () => db.dailySpendingEntries.where('date').startsWith(prefix).toArray(),
    [prefix],
  );
  const byDate = (entries ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] ?? 0) + e.amount;
    return acc;
  }, {});
  return { byDate };
}

/** Rollover decision for a single day */
export function useRolloverDecision(date: string) {
  const decision = useLiveQuery<DailyRolloverDecision | undefined>(
    () => db.dailyRollovers.get(date),
    [date],
  );
  const setDecision = (mode: 'save' | 'rollover') =>
    db.dailyRollovers.put({ date, mode });
  const clearDecision = () =>
    db.dailyRollovers.delete(date);
  return { mode: decision?.mode ?? null, setDecision, clearDecision };
}

/** All rollover decisions for a given month */
export function useMonthlyRollovers(year: number, month: number) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const rollovers = useLiveQuery<DailyRolloverDecision[]>(
    () => db.dailyRollovers.where('date').startsWith(prefix).toArray(),
    [prefix],
  );
  const byDate = (rollovers ?? []).reduce<Record<string, 'save' | 'rollover'>>((acc, r) => {
    acc[r.date] = r.mode;
    return acc;
  }, {});
  return { byDate };
}

/** Savings withdrawal (bonus budget from savings pool) for a single day */
export function useSavingsWithdrawal(date: string) {
  const record = useLiveQuery<DailySavingsWithdrawal | undefined>(
    () => db.dailySavingsWithdrawals.get(date),
    [date],
  );
  const setWithdrawal = (amount: number) =>
    db.dailySavingsWithdrawals.put({ date, amount });
  const clearWithdrawal = () =>
    db.dailySavingsWithdrawals.delete(date);
  return { amount: record?.amount ?? 0, setWithdrawal, clearWithdrawal };
}

/** All savings withdrawals for a given month */
export function useMonthlyWithdrawals(year: number, month: number) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const records = useLiveQuery<DailySavingsWithdrawal[]>(
    () => db.dailySavingsWithdrawals.where('date').startsWith(prefix).toArray(),
    [prefix],
  );
  const byDate = (records ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.date] = r.amount;
    return acc;
  }, {});
  return { byDate };
}

/**
 * Accumulated savings across all time.
 * totalSaved = gross amount saved via "ออมเงิน" decisions
 * totalWithdrawn = total taken back from savings (added to daily budget)
 * availableSavings = totalSaved - totalWithdrawn (capped at 0 min)
 */
export function useAllTimeSavings(settings: DailyBudget | undefined) {
  const allRollovers = useLiveQuery<DailyRolloverDecision[]>(
    () => db.dailyRollovers.toArray(),
    [],
  );
  const allSpending = useLiveQuery<DailySpendingEntry[]>(
    () => db.dailySpendingEntries.toArray(),
    [],
  );
  const allWithdrawals = useLiveQuery<DailySavingsWithdrawal[]>(
    () => db.dailySavingsWithdrawals.toArray(),
    [],
  );

  return useMemo(() => {
    const empty = {
      totalSaved: 0,
      thisMonthSaved: 0,
      savedDays: [] as { date: string; amount: number }[],
      withdrawalDays: [] as { date: string; amount: number }[],
      totalWithdrawn: 0,
      availableSavings: 0,
    };
    if (!allRollovers || !allSpending || !allWithdrawals || !settings) return empty;

    const now = new Date();
    const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Spending by date
    const spendingByDate = allSpending.reduce<Record<string, number>>((acc, e) => {
      acc[e.date] = (acc[e.date] ?? 0) + e.amount;
      return acc;
    }, {});

    // Withdrawals by date
    const withdrawalByDate = allWithdrawals.reduce<Record<string, number>>((acc, w) => {
      acc[w.date] = w.amount;
      return acc;
    }, {});

    // Group rollovers by month
    const rolloversByMonth: Record<string, DailyRolloverDecision[]> = {};
    for (const r of allRollovers) {
      const mk = r.date.slice(0, 7);
      if (!rolloversByMonth[mk]) rolloversByMonth[mk] = [];
      rolloversByMonth[mk].push(r);
    }

    let totalSaved = 0;
    let thisMonthSaved = 0;
    const savedDays: { date: string; amount: number }[] = [];

    for (const [monthKey, decisions] of Object.entries(rolloversByMonth)) {
      const [y, m] = monthKey.split('-').map(Number);
      const month0 = m - 1;

      const monthSpending: Record<string, number> = {};
      for (const [date, amt] of Object.entries(spendingByDate)) {
        if (date.startsWith(monthKey + '-')) monthSpending[date] = amt;
      }
      const monthBonus: Record<string, number> = {};
      for (const [date, amt] of Object.entries(withdrawalByDate)) {
        if (date.startsWith(monthKey + '-')) monthBonus[date] = amt;
      }
      const monthRollovers: Record<string, 'save' | 'rollover'> = {};
      for (const r of decisions) monthRollovers[r.date] = r.mode;

      const effective = computeMonthlyEffectiveBudgets(y, month0, monthSpending, monthRollovers, settings, monthBonus);

      for (const r of decisions) {
        if (r.mode === 'save') {
          const budget = effective[r.date] ?? 0;
          const spent = monthSpending[r.date] ?? 0;
          const net = budget - spent;
          if (net > 0) {
            totalSaved += net;
            savedDays.push({ date: r.date, amount: net });
            if (r.date.startsWith(thisMonthPrefix)) thisMonthSaved += net;
          }
        }
      }
    }

    savedDays.sort((a, b) => b.date.localeCompare(a.date));

    const withdrawalDays = allWithdrawals
      .filter((w) => w.amount > 0)
      .map((w) => ({ date: w.date, amount: w.amount }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const totalWithdrawn = allWithdrawals.reduce((s, w) => s + w.amount, 0);
    const availableSavings = Math.max(0, totalSaved - totalWithdrawn);

    return { totalSaved, thisMonthSaved, savedDays, withdrawalDays, totalWithdrawn, availableSavings };
  }, [allRollovers, allSpending, allWithdrawals, settings]);
}

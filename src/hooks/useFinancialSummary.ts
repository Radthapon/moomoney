'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { computeFinancialSummary } from '@/lib/calculations';

export function useFinancialSummary() {
  const income = useLiveQuery(() => db.income.get(1), []);
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const expenses = useLiveQuery(() => db.monthlyExpenses.toArray(), []);

  const isLoading = income === undefined || debts === undefined || expenses === undefined;
  const summary = computeFinancialSummary(income, debts ?? [], expenses ?? []);

  return { summary, isLoading };
}

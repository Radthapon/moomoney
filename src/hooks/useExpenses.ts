'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { MonthlyExpense } from '@/types';

export function useExpenses() {
  const expenses = useLiveQuery(() => db.monthlyExpenses.orderBy('sortOrder').toArray(), []);

  const addExpense = async (data: Omit<MonthlyExpense, 'id' | 'createdAt' | 'sortOrder'>) => {
    const count = await db.monthlyExpenses.count();
    return db.monthlyExpenses.add({ ...data, sortOrder: count, createdAt: new Date() });
  };

  const updateExpense = async (id: number, data: Partial<Omit<MonthlyExpense, 'id'>>) => {
    return db.monthlyExpenses.update(id, data);
  };

  const deleteExpense = async (id: number) => {
    return db.monthlyExpenses.delete(id);
  };

  return { expenses: expenses ?? [], addExpense, updateExpense, deleteExpense };
}

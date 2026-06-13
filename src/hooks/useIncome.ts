'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Income } from '@/types';

export function useIncome() {
  const income = useLiveQuery(() => db.income.get(1), []);

  const updateIncome = async (salary: number) => {
    await db.income.put({ id: 1, salary, updatedAt: new Date() });
  };

  return { income, updateIncome };
}

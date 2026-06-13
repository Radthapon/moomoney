'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { DailyBudget } from '@/types';

export function useDailyBudget() {
  const dailyBudget = useLiveQuery(() => db.dailyBudget.get(1), []);

  const updateDailyBudget = async (data: Omit<DailyBudget, 'id' | 'updatedAt'>) => {
    await db.dailyBudget.put({ id: 1, ...data, updatedAt: new Date() });
  };

  return { dailyBudget, updateDailyBudget };
}

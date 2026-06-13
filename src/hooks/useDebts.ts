'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Debt } from '@/types';

export function useDebts() {
  const debts = useLiveQuery(() => db.debts.orderBy('sortOrder').toArray(), []);

  const addDebt = async (data: Omit<Debt, 'id' | 'createdAt' | 'sortOrder'>) => {
    const count = await db.debts.count();
    return db.debts.add({ ...data, sortOrder: count, createdAt: new Date() });
  };

  const updateDebt = async (id: number, data: Partial<Omit<Debt, 'id'>>) => {
    return db.debts.update(id, data);
  };

  const deleteDebt = async (id: number) => {
    await db.debtPayments.where('debtId').equals(id).delete();
    return db.debts.delete(id);
  };

  return { debts: debts ?? [], addDebt, updateDebt, deleteDebt };
}

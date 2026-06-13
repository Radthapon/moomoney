'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { DebtPayment } from '@/types';

export function useDebtPayments(debtId: number | undefined) {
  const payments = useLiveQuery<DebtPayment[]>(
    () => (debtId ? db.debtPayments.where('debtId').equals(debtId).toArray() : Promise.resolve([])),
    [debtId],
  );

  const toggleMonth = async (monthNumber: number) => {
    if (!debtId) return;
    const existing = await db.debtPayments
      .where('[debtId+monthNumber]')
      .equals([debtId, monthNumber])
      .first();

    if (existing?.id) {
      await db.debtPayments.update(existing.id, {
        paid: !existing.paid,
        paidAt: !existing.paid ? new Date() : undefined,
      });
    } else {
      await db.debtPayments.add({
        debtId,
        monthNumber,
        paid: true,
        paidAt: new Date(),
      });
    }
  };

  const isPaid = (monthNumber: number) =>
    payments?.find((p) => p.monthNumber === monthNumber)?.paid ?? false;

  const paidCount = payments?.filter((p) => p.paid).length ?? 0;

  return { payments: payments ?? [], isPaid, paidCount, toggleMonth };
}

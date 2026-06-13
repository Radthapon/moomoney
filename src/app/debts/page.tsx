'use client';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDebts } from '@/hooks/useDebts';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { DebtFormDialog } from '@/components/debts/DebtFormDialog';
import { DebtMonthsChecklist } from '@/components/debts/DebtMonthsChecklist';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { formatBaht, DEBT_STATUS_LABELS } from '@/lib/formatters';
import { db } from '@/lib/db';
import type { Debt, DebtPayment } from '@/types';
import type { DebtFormValues } from '@/schemas';
import { Plus, Pencil, Trash2, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusBadge: Record<string, string> = {
  active: 'bg-brand-500/10 text-brand-600',
  pending_interest: 'bg-amber-500/10 text-amber-600',
  paid: 'bg-mint-500/10 text-mint-600',
};

const statusEmoji: Record<string, string> = {
  active: '💳',
  pending_interest: '⏳',
  paid: '✅',
};

function DebtCard({
  debt,
  onChecklist,
  onEdit,
  onDelete,
}: {
  debt: Debt;
  onChecklist: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const payments = useLiveQuery<DebtPayment[]>(
    () => (debt.id ? db.debtPayments.where('debtId').equals(debt.id).toArray() : Promise.resolve([])),
    [debt.id],
  );
  const total = debt.totalMonths ?? 0;
  const paidCount = payments?.filter((p) => p.paid).length ?? 0;
  const pct = total > 0 ? Math.round((paidCount / total) * 100) : 0;

  return (
    <div className={cn('bg-white rounded-3xl p-4 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]', debt.status === 'paid' && 'opacity-60')}>
      <button onClick={onChecklist} className="w-full text-left active:scale-[0.99] transition-transform">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
              {statusEmoji[debt.status]}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-ink truncate">{debt.name}</p>
              <span className={cn('inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold', statusBadge[debt.status])}>
                {DEBT_STATUS_LABELS[debt.status]}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="nums font-extrabold text-rose-500">฿{formatBaht(debt.totalBalance)}</p>
            <p className="text-[11px] text-ink-soft nums">ผ่อน ฿{formatBaht(debt.monthlyPayment)}/ด.</p>
          </div>
        </div>

        {total > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-ink-soft">ความคืบหน้า</span>
              <span className={cn('font-semibold', pct === 100 ? 'text-mint-600' : 'text-brand-600')}>
                {paidCount}/{total} งวด
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', pct === 100 ? 'bg-mint-500' : 'bg-brand-500')}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
          </div>
        )}
        {debt.interestNote && <p className="text-[11px] text-amber-600 mt-2">⚠️ {debt.interestNote}</p>}
      </button>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={onChecklist}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-500/8 text-brand-600 text-xs font-semibold active:scale-95 transition-transform"
        >
          <CalendarCheck size={14} /> ผ่อนรายเดือน
        </button>
        <button onClick={onEdit} className="p-2 rounded-xl bg-slate-100 text-ink-soft active:scale-95 transition-transform">
          <Pencil size={15} />
        </button>
        <button onClick={onDelete} className="p-2 rounded-xl bg-rose-500/10 text-rose-500 active:scale-95 transition-transform">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function DebtsPage() {
  const { debts, addDebt, updateDebt, deleteDebt } = useDebts();
  const { summary } = useFinancialSummary();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Debt | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [checklistDebt, setChecklistDebt] = useState<Debt | null>(null);

  const handleSave = async (data: DebtFormValues) => {
    if (editItem?.id) await updateDebt(editItem.id, data);
    else await addDebt(data);
    setEditItem(undefined);
  };

  const handleEdit = (debt: Debt) => {
    setEditItem(debt);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="หนี้สิน"
        subtitle="จัดการยอดหนี้และการผ่อน"
        emoji="💳"
        action={
          <button
            onClick={() => { setEditItem(undefined); setFormOpen(true); }}
            className="w-11 h-11 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-[0_8px_18px_-6px_rgba(59,110,244,0.6)] active:scale-95 transition-transform"
          >
            <Plus size={22} />
          </button>
        }
      />

      <div className="px-4 flex flex-col gap-3">
        {/* Summary */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-[28px] p-5 text-white shadow-[0_14px_30px_-16px_rgba(59,110,244,0.8)]">
          <p className="text-[13px] text-white/80">ยอดหนี้คงเหลือทั้งหมด</p>
          <p className="nums text-[30px] font-extrabold leading-tight mt-1">฿{formatBaht(summary.totalDebtBalance)}</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/15 rounded-2xl px-3 py-2.5">
              <p className="text-[11px] text-white/75">ผ่อนต่อเดือน</p>
              <p className="nums font-bold">฿{formatBaht(summary.totalDebtPayments)}</p>
            </div>
            <div className="bg-white/15 rounded-2xl px-3 py-2.5">
              <p className="text-[11px] text-white/75">ปิดหนี้แล้วเหลือ/ด.</p>
              <p className="nums font-bold">฿{formatBaht(summary.afterDebtClearMonthly)}</p>
            </div>
          </div>
        </div>

        {debts.length === 0 ? (
          <EmptyState message="ยังไม่มีรายการหนี้" emoji="🎉" />
        ) : (
          debts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onChecklist={() => setChecklistDebt(debt)}
              onEdit={() => handleEdit(debt)}
              onDelete={() => setDeleteId(debt.id!)}
            />
          ))
        )}
      </div>

      <DebtFormDialog open={formOpen} onOpenChange={setFormOpen} editItem={editItem} onSave={handleSave} />
      {checklistDebt && (
        <DebtMonthsChecklist
          open={!!checklistDebt}
          onOpenChange={(o) => !o && setChecklistDebt(null)}
          debt={checklistDebt}
        />
      )}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบรายการหนี้"
        description="คุณต้องการลบรายการนี้ใช่ไหม? การลบไม่สามารถกู้คืนได้"
        onConfirm={() => deleteId && deleteDebt(deleteId)}
      />
    </div>
  );
}

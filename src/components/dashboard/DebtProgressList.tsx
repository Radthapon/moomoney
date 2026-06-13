'use client';
import { formatBaht } from '@/lib/formatters';
import type { Debt } from '@/types';

interface Props {
  debts: Debt[];
}

const statusColor: Record<string, string> = {
  active: 'bg-brand-500',
  pending_interest: 'bg-amber-500',
  paid: 'bg-mint-500',
};

const statusEmoji: Record<string, string> = {
  active: '💳',
  pending_interest: '⏳',
  paid: '✅',
};

export function DebtProgressList({ debts }: Props) {
  const totalBalance = debts.reduce((s, d) => s + d.totalBalance, 0);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-ink">ยอดหนี้แต่ละรายการ</h3>
        <span className="nums text-sm font-extrabold text-rose-500">฿{formatBaht(totalBalance)}</span>
      </div>
      <div className="flex flex-col gap-3.5">
        {debts.map((debt) => {
          const pct = totalBalance > 0 ? (debt.totalBalance / totalBalance) * 100 : 0;
          return (
            <div key={debt.id}>
              <div className="flex justify-between items-center text-sm mb-1.5">
                <span className="font-medium text-ink flex items-center gap-1.5">
                  <span className="text-base">{statusEmoji[debt.status]}</span>
                  {debt.name}
                </span>
                <span className="text-ink-soft nums">฿{formatBaht(debt.totalBalance)}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${statusColor[debt.status]}`}
                  style={{ width: `${Math.max(pct, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

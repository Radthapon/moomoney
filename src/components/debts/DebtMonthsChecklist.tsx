'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { useDebtPayments } from '@/hooks/useDebtPayments';
import { formatBaht } from '@/lib/formatters';
import type { Debt } from '@/types';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt;
}

const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function getMonthLabel(monthIndex: number, debt: Debt): string {
  if (!debt.createdAt) return `เดือนที่ ${monthIndex}`;
  const start = new Date(debt.createdAt);
  const d = new Date(start.getFullYear(), start.getMonth() + monthIndex - 1, 1);
  return `${THAI_MONTHS[d.getMonth()]} ${String(d.getFullYear() + 543).slice(2)}`;
}

export function DebtMonthsChecklist({ open, onOpenChange, debt }: Props) {
  const { isPaid, paidCount, toggleMonth } = useDebtPayments(debt.id);
  const total = debt.totalMonths || 0;
  const pct = total > 0 ? Math.round((paidCount / total) * 100) : 0;
  const remaining = Math.max(total - paidCount, 0);
  const remainingAmount = remaining * debt.monthlyPayment;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-50" />
        <Dialog.Content className="fixed left-1/2 bottom-0 -translate-x-1/2 w-full max-w-[460px] bg-white rounded-t-[28px] z-50 max-h-[92vh] flex flex-col animate-sheet">
          <div className="px-5 pt-3 pb-4 shrink-0">
            <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-200 mb-3" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <Dialog.Title className="font-bold text-ink text-lg">{debt.name}</Dialog.Title>
                <p className="text-xs text-ink-soft mt-0.5 nums">฿{formatBaht(debt.monthlyPayment)} / เดือน</p>
              </div>
              <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-ink-soft">
                <X size={18} />
              </button>
            </div>

            {total === 0 ? (
              <p className="text-sm text-ink-soft text-center py-6">
                ยังไม่ได้ตั้งจำนวนเดือนผ่อน<br />แก้ไขหนี้เพื่อเพิ่มจำนวนเดือน
              </p>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', pct === 100 ? 'bg-mint-500' : 'bg-brand-500')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-ink whitespace-nowrap nums">{pct}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-mint-500/10 rounded-2xl px-3 py-2.5 text-center">
                    <p className="text-[11px] text-mint-600">จ่ายแล้ว</p>
                    <p className="font-bold text-mint-600 nums">{paidCount} ด.</p>
                  </div>
                  <div className="bg-slate-100 rounded-2xl px-3 py-2.5 text-center">
                    <p className="text-[11px] text-ink-soft">เหลืออีก</p>
                    <p className="font-bold text-ink nums">{remaining} ด.</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-2xl px-3 py-2.5 text-center">
                    <p className="text-[11px] text-amber-600">ยอดคงเหลือ</p>
                    <p className="font-bold text-amber-600 text-xs mt-0.5 nums">฿{formatBaht(remainingAmount)}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {total > 0 && (
            <div className="overflow-y-auto px-5 pb-7">
              <p className="text-xs text-ink-soft mb-3">แตะเพื่อทำเครื่องหมายจ่ายแล้ว</p>
              <div className="grid grid-cols-4 gap-2.5">
                {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
                  const paid = isPaid(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggleMonth(n)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-2xl py-3 px-1 border transition-all active:scale-95',
                        paid
                          ? 'bg-mint-500 border-mint-500 text-white shadow-[0_6px_14px_-6px_rgba(22,199,154,0.7)]'
                          : 'bg-slate-50 border-slate-200 text-ink-soft',
                      )}
                    >
                      <span className={cn('w-6 h-6 rounded-full flex items-center justify-center', paid ? 'bg-white/25' : 'bg-white border border-slate-200')}>
                        {paid && <Check size={15} strokeWidth={3} />}
                      </span>
                      <span className="text-[11px] font-semibold leading-none">{getMonthLabel(n, debt)}</span>
                      <span className={cn('text-[10px] leading-none nums', paid ? 'text-white/70' : 'text-ink-soft/70')}>#{n}</span>
                    </button>
                  );
                })}
              </div>
              {pct === 100 && (
                <div className="bg-mint-500/10 rounded-2xl p-3.5 text-center text-sm text-mint-600 font-bold mt-4">
                  🎉 ผ่อนครบทุกงวดแล้ว!
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

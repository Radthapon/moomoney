'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { useRef, useState } from 'react';
import { useDailySpending, useRolloverDecision } from '@/hooks/useDailySpending';
import { formatBaht } from '@/lib/formatters';
import { X, Trash2, PiggyBank, ArrowRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: string; // 'YYYY-MM-DD'
  dailyBudget: number;
}

function parseDateLabel(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const thMonth = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${d} ${thMonth[m - 1]} ${y + 543}`;
}

export function DayDetailSheet({ open, onOpenChange, date, dailyBudget }: Props) {
  const { entries, total, addEntry, deleteEntry } = useDailySpending(date);
  const { mode, setDecision, clearDecision } = useRolloverDecision(date);
  const todayStr = new Date().toLocaleDateString('sv-SE');
  const isPast = date < todayStr;
  const remaining = dailyBudget - total;
  const pct = dailyBudget > 0 ? Math.min((total / dailyBudget) * 100, 100) : 0;
  const over = total > dailyBudget;

  const amtRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    const amt = parseFloat(amtRef.current?.value ?? '');
    const note = noteRef.current?.value.trim() ?? '';
    if (isNaN(amt) || amt <= 0) return;
    setAdding(true);
    await addEntry(amt, note);
    if (amtRef.current) amtRef.current.value = '';
    if (noteRef.current) noteRef.current.value = '';
    amtRef.current?.focus();
    setAdding(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-50" />
        <Dialog.Content className="fixed left-1/2 bottom-0 -translate-x-1/2 w-full max-w-[460px] bg-white rounded-t-[28px] z-50 max-h-[80vh] flex flex-col animate-sheet">
          <div className="px-5 pt-3 shrink-0">
            <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-200 mb-3" />
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="font-bold text-ink text-lg">{parseDateLabel(date)}</Dialog.Title>
              <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-ink-soft">
                <X size={18} />
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-slate-50 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-ink-soft">งบ/วัน</p>
                <p className="nums font-bold text-ink text-sm">฿{formatBaht(dailyBudget)}</p>
              </div>
              <div className="bg-rose-500/8 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-ink-soft">ใช้ไป</p>
                <p className="nums font-bold text-rose-500 text-sm">฿{formatBaht(total)}</p>
              </div>
              <div className={cn('rounded-2xl p-3 text-center', over ? 'bg-rose-500/8' : 'bg-mint-500/8')}>
                <p className="text-[10px] text-ink-soft">{over ? 'เกิน' : 'เหลือ'}</p>
                <p className={cn('nums font-bold text-sm', over ? 'text-rose-500' : 'text-mint-600')}>
                  ฿{formatBaht(Math.abs(remaining))}
                </p>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div
                className={cn('h-full rounded-full', over ? 'bg-rose-500' : 'bg-mint-500')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="overflow-y-auto px-5 pb-8">
            {/* Retroactive expense form — past days only */}
            {isPast && (
              <div className="mb-4 pb-4 border-b border-slate-100">
                <p className="text-[12px] font-semibold text-ink-soft mb-2">บันทึกรายจ่ายย้อนหลัง</p>
                <div className="flex gap-2">
                  <div className="relative w-28 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm select-none">฿</span>
                    <input
                      ref={amtRef}
                      type="number" min="0" step="1"
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      placeholder="0"
                      className="w-full bg-slate-100 rounded-2xl pl-7 pr-3 py-2.5 text-sm font-bold text-ink nums focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>
                  <input
                    ref={noteRef}
                    type="text"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="รายการ เช่น กาแฟ, ข้าว..."
                    className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />
                  <button
                    onClick={handleAdd} disabled={adding}
                    className="w-11 h-11 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-[0_6px_14px_-6px_rgba(59,110,244,0.6)] active:scale-95 transition-transform shrink-0 disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}

            {entries.length === 0 ? (
              <p className="text-center text-ink-soft text-sm py-6">ไม่มีรายการ</p>
            ) : (
              <div className="flex flex-col gap-2">
                {entries.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{e.note || '—'}</p>
                      <p className="text-[10px] text-ink-soft">
                        {new Date(e.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="nums font-bold text-ink shrink-0">฿{formatBaht(e.amount)}</span>
                    <button
                      onClick={() => e.id && deleteEntry(e.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 active:scale-90 transition-transform shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Rollover / save decision */}
            {remaining !== 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                {remaining < 0 ? (
                  <div className="flex items-center gap-2 bg-rose-50 rounded-2xl px-3 py-2.5">
                    <ArrowRight size={14} className="text-rose-500 shrink-0" />
                    <p className="text-[12px] text-rose-600 font-medium">
                      เกิน <span className="font-bold nums">฿{formatBaht(Math.abs(remaining))}</span> → หักจากงบวันถัดไปอัตโนมัติ
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-ink-soft mb-2">
                      เหลือ <span className="nums font-bold text-ink">฿{formatBaht(remaining)}</span> — จะเอาไปไหน?
                    </p>
                    <div className={cn('grid gap-2', isPast ? 'grid-cols-1' : 'grid-cols-2')}>
                      <button
                        type="button"
                        onClick={() => mode === 'save' ? clearDecision() : setDecision('save')}
                        className={cn(
                          'flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95',
                          mode === 'save'
                            ? 'bg-brand-500 text-white shadow-[0_4px_10px_-4px_rgba(59,110,244,0.5)]'
                            : 'bg-slate-100 text-ink-soft',
                        )}
                      >
                        <PiggyBank size={14} /> ออมเงิน
                      </button>
                      {!isPast && (
                        <button
                          type="button"
                          onClick={() => mode === 'rollover' ? clearDecision() : setDecision('rollover')}
                          className={cn(
                            'flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95',
                            mode === 'rollover'
                              ? 'bg-mint-500 text-white shadow-[0_4px_10px_-4px_rgba(22,199,154,0.5)]'
                              : 'bg-slate-100 text-ink-soft',
                          )}
                        >
                          <ArrowRight size={14} /> ใช้วันถัดไป
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

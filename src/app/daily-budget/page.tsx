'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDailyBudget } from '@/hooks/useDailyBudget';
import {
  useDailySpending,
  useMonthlySpending,
  useMonthlyRollovers,
  useMonthlyWithdrawals,
  useRolloverDecision,
  useSavingsWithdrawal,
  useAllTimeSavings,
  toDateStr,
  computeMonthlyEffectiveBudgets,
  getBaseBudgetForDate,
} from '@/hooks/useDailySpending';
import { AddFromSavingsSheet } from '@/components/daily-budget/AddFromSavingsSheet';
import { dailyBudgetSchema, type DailyBudgetFormValues } from '@/schemas';
import { formatBaht } from '@/lib/formatters';
import { PageHeader } from '@/components/common/PageHeader';
import { DayDetailSheet } from '@/components/daily-budget/DayDetailSheet';
import { ProgressRing } from '@/components/common/ProgressRing';
import { Save, Plus, Trash2, ChevronLeft, ChevronRight, Settings2, PiggyBank, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const inputCls =
  'w-full bg-slate-100 rounded-2xl px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-300 transition nums';
const labelCls = 'text-[13px] font-semibold text-ink block mb-1.5';

const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const TH_DAYS_GRID = ['อา','จ','อ','พ','พฤ','ศ','ส'];
const TRANSPORT_DAY_LABELS = ['อา','จ','อ','พ','พฤ','ศ','ส'];
const TRANSPORT_DOW = [0, 1, 2, 3, 4, 5, 6];

function countTransportDaysInMonth(selectedDows: number[], year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (selectedDows.includes(new Date(year, month, d).getDay())) count++;
  }
  return count;
}

/** Rollover toggle shown at the bottom of today's entry card */
function RolloverToggle({ date, remaining }: { date: string; remaining: number }) {
  const { mode, setDecision, clearDecision } = useRolloverDecision(date);

  if (remaining === 0) return null;

  if (remaining < 0) {
    return (
      <div className="mt-3 pt-3 border-t border-dashed border-slate-100">
        <div className="flex items-center gap-2 bg-rose-50 rounded-2xl px-3 py-2.5">
          <ArrowRight size={14} className="text-rose-500 shrink-0" />
          <p className="text-[12px] text-rose-600 font-medium">
            เกิน <span className="font-bold nums">฿{formatBaht(Math.abs(remaining))}</span> → หักจากงบพรุ่งนี้อัตโนมัติ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-dashed border-slate-100">
      <p className="text-[11px] text-ink-soft mb-2">
        เหลือ <span className="nums font-bold text-ink">฿{formatBaht(remaining)}</span> — จะเอาไปไหน?
      </p>
      <div className="grid grid-cols-2 gap-2">
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
          <ArrowRight size={14} /> ใช้พรุ่งนี้
        </button>
      </div>
    </div>
  );
}

function MonthCalendar({
  year, month,
  effectiveBudgets,
  spendingByDate,
  onSelectDay,
}: {
  year: number; month: number;
  effectiveBudgets: Record<string, number>;
  spendingByDate: Record<string, number>;
  onSelectDay: (date: string) => void;
}) {
  const today = toDateStr();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  const monthStr = `${year}-${pad(month + 1)}`;

  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {TH_DAYS_GRID.map((d) => (
          <div key={d} className="text-center text-[10px] text-ink-soft font-semibold py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${monthStr}-${pad(day)}`;
          const spent = spendingByDate[dateStr] ?? 0;
          const budget = effectiveBudgets[dateStr] ?? 0;
          const isToday = dateStr === today;
          const pct = budget > 0 && spent > 0 ? spent / budget : 0;

          const bgColor =
            spent === 0 ? ''
            : pct > 1   ? 'bg-rose-500'
            : pct > 0.8 ? 'bg-amber-400'
            :              'bg-mint-500';

          return (
            <button
              key={day}
              onClick={() => onSelectDay(dateStr)}
              className={cn(
                'rounded-xl py-1.5 flex flex-col items-center gap-0.5 transition-all active:scale-90',
                bgColor || 'bg-slate-50',
                isToday && 'ring-2 ring-brand-500 ring-offset-1',
              )}
            >
              <span className={cn(
                'text-[12px] font-bold leading-none',
                spent > 0 ? 'text-white' : isToday ? 'text-brand-600' : 'text-ink',
              )}>
                {day}
              </span>
              {spent > 0 && (
                <span className="text-[9px] font-medium leading-none text-white">
                  ฿{Math.round(spent)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DailyBudgetPage() {
  const { dailyBudget, updateDailyBudget } = useDailyBudget();
  const now = new Date();
  const today = toDateStr();
  const todayDow = now.getDay();

  // --- Settings form ---
  const [transportDays, setTransportDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const { register, handleSubmit, watch, reset, formState: { isDirty } } = useForm<DailyBudgetFormValues>({
    resolver: zodResolver(dailyBudgetSchema),
    defaultValues: { perMeal: 75, dailyTransport: 75 },
  });

  useEffect(() => {
    if (dailyBudget) {
      reset({ perMeal: dailyBudget.perMeal, dailyTransport: dailyBudget.dailyTransport });
      setTransportDays(dailyBudget.transportDays ?? [1, 2, 3, 4, 5]);
    }
  }, [dailyBudget, reset]);

  const { perMeal, dailyTransport } = watch();

  const toggleTransportDay = (dow: number) => {
    setTransportDays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow].sort(),
    );
  };

  const onSubmit = async (data: DailyBudgetFormValues) => {
    await updateDailyBudget({ perMeal: data.perMeal, dailyTransport: data.dailyTransport, transportDays });
    reset(data);
  };

  // --- Today's savings withdrawal (bonus budget from savings pool) ---
  const { amount: savingsBonusToday, setWithdrawal: setSavingsWithdrawal } = useSavingsWithdrawal(today);

  // --- Monthly data for current month (today's effective budget) ---
  const { byDate: thisMonthSpending } = useMonthlySpending(now.getFullYear(), now.getMonth());
  const { byDate: thisMonthRollovers } = useMonthlyRollovers(now.getFullYear(), now.getMonth());
  const { byDate: thisMonthWithdrawals } = useMonthlyWithdrawals(now.getFullYear(), now.getMonth());

  const thisMonthEffective = useMemo(
    () => computeMonthlyEffectiveBudgets(now.getFullYear(), now.getMonth(), thisMonthSpending, thisMonthRollovers, dailyBudget, thisMonthWithdrawals),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now.getFullYear(), now.getMonth(), thisMonthSpending, thisMonthRollovers, dailyBudget, thisMonthWithdrawals],
  );

  const budgetToday = thisMonthEffective[today] ?? getBaseBudgetForDate(today, dailyBudget);
  const baseBudgetToday = getBaseBudgetForDate(today, dailyBudget);
  const isTodayTransportDay = (dailyBudget?.transportDays ?? transportDays).includes(todayDow);
  const rolloverDiff = budgetToday - baseBudgetToday - savingsBonusToday;
  const hasRolloverBonus = rolloverDiff !== 0;

  // --- Calendar month data ---
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const { byDate: calMonthSpending } = useMonthlySpending(calYear, calMonth);
  const { byDate: calMonthRollovers } = useMonthlyRollovers(calYear, calMonth);
  const { byDate: calMonthWithdrawals } = useMonthlyWithdrawals(calYear, calMonth);

  const calMonthEffective = useMemo(
    () => computeMonthlyEffectiveBudgets(calYear, calMonth, calMonthSpending, calMonthRollovers, dailyBudget, calMonthWithdrawals),
    [calYear, calMonth, calMonthSpending, calMonthRollovers, dailyBudget, calMonthWithdrawals],
  );

  const prevCalMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); } else setCalMonth((m) => m - 1); };
  const nextCalMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); } else setCalMonth((m) => m + 1); };

  // --- Budget summary calculations (for settings preview) ---
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const transportDaysThisMonth = countTransportDaysInMonth(transportDays, now.getFullYear(), now.getMonth());
  const monthlyFood = (perMeal ?? 0) * 3 * daysInMonth;
  const monthlyTransport = (dailyTransport ?? 0) * transportDaysThisMonth;
  const totalMonthly = monthlyFood + monthlyTransport;

  // --- Today's spending ---
  const { entries, total, addEntry, deleteEntry } = useDailySpending(today);
  const remaining = budgetToday - total;
  const over = total > budgetToday;

  // If user has committed the remainder (save or rollover), treat it as ฿0 remaining for display
  const { mode: todayRolloverMode } = useRolloverDecision(today);
  const committed = todayRolloverMode !== null && remaining > 0;
  const displayRemaining = committed ? 0 : remaining;
  const displayOver = committed ? false : over;
  const spentPct = budgetToday > 0 ? Math.min((committed ? budgetToday : total) / budgetToday * 100, 100) : 0;

  // Quick add
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

  const { totalSaved, thisMonthSaved, savedDays, totalWithdrawn, availableSavings } = useAllTimeSavings(dailyBudget);

  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddSavings, setShowAddSavings] = useState(false);

  return (
    <div>
      <PageHeader title="งบรายวัน" subtitle="ติดตามรายจ่ายประจำวัน" emoji="📅" />

      <div className="px-4 flex flex-col gap-3 pb-4">
        {/* Hero card */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-[28px] p-5 text-white shadow-[0_14px_30px_-16px_rgba(59,110,244,0.8)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-white/80">วันนี้เหลือ</p>
              <div className="flex items-center gap-2">
                <p className={cn('nums text-[30px] font-extrabold leading-tight mt-0.5', displayOver && 'text-rose-200')}>
                  {displayOver ? '-' : ''}฿{formatBaht(Math.abs(displayRemaining))}
                </p>
                {availableSavings > 0 && (
                  <button
                    onClick={() => setShowAddSavings(true)}
                    className="mt-0.5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-all shrink-0"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
              <p className="text-xs text-white/70 mt-1 nums">
                ใช้ไป ฿{formatBaht(total)} / งบ ฿{formatBaht(budgetToday)}
              </p>
              {isTodayTransportDay && (
                <p className="text-[11px] text-white/60 mt-0.5">🚌 รวมค่ารถ ฿{formatBaht(dailyBudget?.dailyTransport ?? 0)}</p>
              )}
              {savingsBonusToday > 0 && (
                <p className="text-[11px] text-white/60 mt-0.5">🐷 เพิ่มจากออม <span className="nums">฿{formatBaht(savingsBonusToday)}</span></p>
              )}
              {hasRolloverBonus && (
                <p className="text-[11px] text-white/60 mt-0.5">
                  {rolloverDiff > 0 ? '➕' : '➖'} ยกมาจากเมื่อวาน <span className="nums">฿{formatBaht(Math.abs(rolloverDiff))}</span>
                </p>
              )}
            </div>
            <ProgressRing
              value={spentPct}
              size={96} stroke={10}
              from={displayOver ? '#fb7185' : '#34d8a6'}
              to={displayOver ? '#f43f5e' : '#16c79a'}
              track="rgba(255,255,255,0.2)"
            >
              <span className="text-lg font-extrabold text-white nums">{Math.round(spentPct)}%</span>
            </ProgressRing>
          </div>
        </div>

        {/* Quick add + rollover toggle */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
          <p className="text-[13px] font-bold text-ink mb-3">เพิ่มรายจ่ายวันนี้</p>
          <div className="flex gap-2 mb-2">
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

          {entries.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-100">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-ink truncate">{e.note || '—'}</span>
                  </div>
                  <span className="nums text-sm font-bold text-ink shrink-0">฿{formatBaht(e.amount)}</span>
                  <button onClick={() => e.id && deleteEntry(e.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 active:scale-90 transition-transform shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-100">
                <span className="text-xs text-ink-soft">รวมวันนี้</span>
                <span className="nums font-extrabold text-rose-500">฿{formatBaht(total)}</span>
              </div>
              {todayRolloverMode !== null && remaining > 0 && (
                <div className={cn(
                  'flex justify-between items-center px-3 py-2 rounded-2xl text-xs font-semibold',
                  todayRolloverMode === 'save' ? 'bg-brand-500/8 text-brand-600' : 'bg-mint-500/8 text-mint-700',
                )}>
                  <span className="flex items-center gap-1.5">
                    {todayRolloverMode === 'save'
                      ? <><PiggyBank size={13} /> ออมเงิน</>
                      : <><ArrowRight size={13} /> ใช้พรุ่งนี้</>
                    }
                  </span>
                  <span className="nums font-bold">฿{formatBaht(remaining)}</span>
                </div>
              )}
            </div>
          )}

          <RolloverToggle date={today} remaining={remaining} />
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevCalMonth} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-ink-soft active:scale-90 transition-transform">
              <ChevronLeft size={16} />
            </button>
            <h3 className="font-bold text-ink">{TH_MONTHS[calMonth]} {calYear + 543}</h3>
            <button onClick={nextCalMonth} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-ink-soft active:scale-90 transition-transform">
              <ChevronRight size={16} />
            </button>
          </div>
          <MonthCalendar
            year={calYear} month={calMonth}
            effectiveBudgets={calMonthEffective}
            spendingByDate={calMonthSpending}
            onSelectDay={(d) => { if (d !== today) setDetailDate(d); }}
          />
          <div className="flex items-center gap-3 mt-4 justify-center flex-wrap">
            {[{ color: 'bg-mint-500', label: 'ไม่เกินงบ' }, { color: 'bg-amber-400', label: 'ใกล้ครบ' }, { color: 'bg-rose-500', label: 'เกินงบ' }].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <span className={cn('w-2.5 h-2.5 rounded-full', color)} />
                <span className="text-[10px] text-ink-soft">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-ink-soft mt-1.5">แตะวันที่ผ่านมาเพื่อดูรายละเอียด</p>
        </div>

        {/* Settings toggle */}
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="flex items-center justify-between w-full bg-white rounded-3xl px-5 py-4 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]"
        >
          <span className="font-bold text-ink flex items-center gap-2">
            <Settings2 size={16} className="text-brand-500" /> ตั้งค่างบรายวัน
          </span>
          <span className="text-ink-soft text-xs">{showSettings ? 'ซ่อน ▲' : 'แก้ไข ▼'}</span>
        </button>

        {showSettings && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>🍜 มื้อละ (฿)</label>
                  <input {...register('perMeal', { valueAsNumber: true })} type="number" step="1" className={inputCls} />
                  <p className="text-[11px] text-ink-soft mt-1">× 3 มื้อ × {daysInMonth} วัน</p>
                </div>
                <div>
                  <label className={labelCls}>🚌 ค่ารถ/วัน (฿)</label>
                  <input {...register('dailyTransport', { valueAsNumber: true })} type="number" step="1" className={inputCls} />
                  <p className="text-[11px] text-ink-soft mt-1">× {transportDaysThisMonth} วัน/เดือนนี้</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
              <p className="font-bold text-ink mb-1">วันที่มีค่ารถ</p>
              <p className="text-[11px] text-ink-soft mb-3">เลือกวันที่ต้องจ่ายค่าเดินทาง — วันที่ไม่ได้เลือกจะไม่รวมค่ารถในงบ</p>
              <div className="grid grid-cols-7 gap-1.5">
                {TRANSPORT_DOW.map((dow, i) => (
                  <button
                    key={dow}
                    type="button"
                    onClick={() => toggleTransportDay(dow)}
                    className={cn(
                      'flex flex-col items-center gap-0.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-90',
                      transportDays.includes(dow)
                        ? 'bg-brand-500 text-white shadow-[0_4px_10px_-4px_rgba(59,110,244,0.6)]'
                        : 'bg-slate-100 text-ink-soft',
                    )}
                  >
                    {TRANSPORT_DAY_LABELS[i]}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl p-4 text-white">
              <p className="text-xs text-white/80 mb-1">ประมาณการเดือน{TH_MONTHS[now.getMonth()]} ({daysInMonth} วัน)</p>
              <p className="nums text-2xl font-extrabold">฿{formatBaht(totalMonthly)}</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-white/15 rounded-2xl px-3 py-2">
                  <p className="text-[10px] text-white/75">อาหาร ({daysInMonth} วัน × 3 มื้อ)</p>
                  <p className="nums font-bold text-sm">฿{formatBaht(monthlyFood)}</p>
                </div>
                <div className="bg-white/15 rounded-2xl px-3 py-2">
                  <p className="text-[10px] text-white/75">ค่ารถ ({transportDaysThisMonth} วัน)</p>
                  <p className="nums font-bold text-sm">฿{formatBaht(monthlyTransport)}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isDirty && (dailyBudget?.transportDays ?? [1,2,3,4,5]).join() === transportDays.join()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-500 text-white font-semibold shadow-[0_8px_18px_-6px_rgba(59,110,244,0.6)] active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              <Save size={16} /> บันทึกการตั้งค่า
            </button>
          </form>
        )}

        {/* Savings card */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-mint-500/15 rounded-2xl flex items-center justify-center shrink-0">
              <PiggyBank size={20} className="text-mint-600" />
            </div>
            <div>
              <p className="font-bold text-ink">เงินออมสะสม</p>
              <p className="text-[11px] text-ink-soft">ยอดที่เลือกออมทั้งหมด</p>
            </div>
          </div>

          <p className="nums text-[36px] font-extrabold text-mint-600 leading-none">
            ฿{formatBaht(totalSaved)}
          </p>
          <p className="text-xs text-ink-soft nums mt-1 mb-4">
            เดือนนี้ <span className="font-semibold text-mint-600">฿{formatBaht(thisMonthSaved)}</span>
          </p>

          {savedDays.length > 0 ? (
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-ink-soft">ประวัติการออม</p>
              {savedDays.slice(0, 5).map(({ date, amount }) => {
                const [y, mo, d] = date.split('-').map(Number);
                const thMonth = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
                return (
                  <div key={date} className="flex justify-between items-center py-1">
                    <span className="text-sm text-ink">{d} {thMonth[mo - 1]} {y + 543}</span>
                    <span className="nums font-bold text-mint-600">+฿{formatBaht(amount)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-3 border-t border-slate-100">
              <p className="text-sm text-ink-soft">ยังไม่มีการออม</p>
              <p className="text-[11px] text-ink-soft/70">กด "ออมเงิน" เมื่อมียอดเหลือประจำวัน</p>
            </div>
          )}
        </div>
      </div>

      {detailDate && (
        <DayDetailSheet
          open={!!detailDate}
          onOpenChange={(v) => !v && setDetailDate(null)}
          date={detailDate}
          dailyBudget={calMonthEffective[detailDate] ?? getBaseBudgetForDate(detailDate, dailyBudget)}
        />
      )}
    </div>
  );
}

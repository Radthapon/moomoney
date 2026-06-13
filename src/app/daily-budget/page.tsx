'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDailyBudget } from '@/hooks/useDailyBudget';
import { dailyBudgetSchema, type DailyBudgetFormValues } from '@/schemas';
import { formatBaht } from '@/lib/formatters';
import { PageHeader } from '@/components/common/PageHeader';
import { Save } from 'lucide-react';

const inputCls =
  'w-full bg-slate-100 rounded-2xl px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-300 transition nums';
const labelCls = 'text-[13px] font-semibold text-ink block mb-1.5';

export default function DailyBudgetPage() {
  const { dailyBudget, updateDailyBudget } = useDailyBudget();
  const { register, handleSubmit, watch, reset, formState: { isDirty } } = useForm<DailyBudgetFormValues>({
    resolver: zodResolver(dailyBudgetSchema),
    defaultValues: { perMeal: 75, dailyTransport: 75, holidayFood: 225, rangeMin: 60, rangeMax: 80 },
  });

  useEffect(() => {
    if (dailyBudget) {
      reset({
        perMeal: dailyBudget.perMeal,
        dailyTransport: dailyBudget.dailyTransport,
        holidayFood: dailyBudget.holidayFood,
        rangeMin: dailyBudget.rangeMin,
        rangeMax: dailyBudget.rangeMax,
      });
    }
  }, [dailyBudget, reset]);

  const values = watch();
  const workdayTotal = (values.perMeal ?? 0) * 3 + (values.dailyTransport ?? 0);
  const workdays = 22;
  const holidays = 8;
  const workdayMonthly = workdayTotal * workdays;
  const holidayMonthly = (values.holidayFood ?? 0) * holidays;
  const totalMonthly = workdayMonthly + holidayMonthly;

  const onSubmit = async (data: DailyBudgetFormValues) => {
    await updateDailyBudget({
      perMeal: data.perMeal,
      dailyTransport: data.dailyTransport,
      holidayFood: data.holidayFood,
      workdayTotal,
      rangeMin: data.rangeMin,
      rangeMax: data.rangeMax,
    });
    reset(data);
  };

  return (
    <div>
      <PageHeader title="งบรายวัน" subtitle="ตั้งงบอาหารและการเดินทาง" emoji="📅" />

      <div className="px-4 flex flex-col gap-3">
        {/* Calculator hero */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-[28px] p-5 text-white shadow-[0_14px_30px_-16px_rgba(59,110,244,0.8)]">
          <p className="text-[13px] text-white/80">ประมาณค่าใช้จ่าย/เดือน</p>
          <p className="nums text-[30px] font-extrabold leading-tight mt-1">฿{formatBaht(totalMonthly)}</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/15 rounded-2xl px-3 py-2.5">
              <p className="text-[11px] text-white/75">วันทำงาน {workdays} วัน</p>
              <p className="nums font-bold">฿{formatBaht(workdayMonthly)}</p>
            </div>
            <div className="bg-white/15 rounded-2xl px-3 py-2.5">
              <p className="text-[11px] text-white/75">วันหยุด {holidays} วัน</p>
              <p className="nums font-bold">฿{formatBaht(holidayMonthly)}</p>
            </div>
          </div>
          <div className="mt-3 bg-white/10 rounded-2xl px-4 py-2.5 flex justify-between items-center">
            <span className="text-xs text-white/80">ใช้รวม/วันทำงาน (3 มื้อ + รถ)</span>
            <span className="nums font-bold">฿{formatBaht(workdayTotal)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
            <h3 className="font-bold text-ink mb-4 flex items-center gap-2">☀️ วันทำงาน</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>มื้อละ (฿)</label>
                <input {...register('perMeal', { valueAsNumber: true })} type="number" step="1" className={inputCls} />
                <p className="text-[11px] text-ink-soft mt-1">× 3 มื้อ/วัน</p>
              </div>
              <div>
                <label className={labelCls}>ค่ารถ/วัน (฿)</label>
                <input {...register('dailyTransport', { valueAsNumber: true })} type="number" step="1" className={inputCls} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
            <h3 className="font-bold text-ink mb-4 flex items-center gap-2">🌴 วันหยุด</h3>
            <label className={labelCls}>ค่ากิน/วันหยุด (฿)</label>
            <input {...register('holidayFood', { valueAsNumber: true })} type="number" step="1" className={inputCls} />
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
            <h3 className="font-bold text-ink mb-4">ช่วงงบประมาณ/มื้อ (฿)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ต่ำสุด</label>
                <input {...register('rangeMin', { valueAsNumber: true })} type="number" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>สูงสุด</label>
                <input {...register('rangeMax', { valueAsNumber: true })} type="number" className={inputCls} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isDirty}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-500 text-white font-semibold shadow-[0_8px_18px_-6px_rgba(59,110,244,0.6)] active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            <Save size={16} /> บันทึก
          </button>
        </form>
      </div>
    </div>
  );
}

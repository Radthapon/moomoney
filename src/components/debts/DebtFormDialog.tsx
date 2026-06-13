'use client';
import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { debtSchema, type DebtFormValues } from '@/schemas';
import type { Debt } from '@/types';
import { X, Wand2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Debt;
  onSave: (data: DebtFormValues) => void;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'กำลังผ่อน' },
  { value: 'pending_interest', label: 'รอดอกเบี้ย' },
  { value: 'paid', label: 'ชำระแล้ว' },
];

const inputCls =
  'w-full bg-slate-100 rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand-300 transition';
const labelCls = 'text-[13px] font-semibold text-ink block mb-1.5';

export function DebtFormDialog({ open, onOpenChange, editItem, onSave }: Props) {
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
  });

  const balance = useWatch({ control, name: 'totalBalance' });
  const payment = useWatch({ control, name: 'monthlyPayment' });

  useEffect(() => {
    if (open) {
      reset(
        editItem
          ? {
              name: editItem.name,
              monthlyPayment: editItem.monthlyPayment,
              totalBalance: editItem.totalBalance,
              totalMonths: editItem.totalMonths ?? 0,
              interestNote: editItem.interestNote,
              status: editItem.status,
            }
          : { name: '', monthlyPayment: 0, totalBalance: 0, totalMonths: 0, interestNote: '', status: 'active' },
      );
    }
  }, [open, editItem, reset]);

  const autoCalcMonths = () => {
    const b = Number(balance) || 0;
    const p = Number(payment) || 0;
    if (p > 0) setValue('totalMonths', Math.ceil(b / p));
  };

  const onSubmit = (data: DebtFormValues) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-50" />
        <Dialog.Content className="fixed left-1/2 bottom-0 -translate-x-1/2 w-full max-w-[460px] bg-white rounded-t-[28px] z-50 max-h-[92vh] flex flex-col animate-sheet">
          <div className="px-5 pt-3 pb-2 shrink-0">
            <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-200 mb-3" />
            <div className="flex justify-between items-center">
              <Dialog.Title className="font-bold text-ink text-lg">
                {editItem ? 'แก้ไขหนี้' : 'เพิ่มหนี้ใหม่'}
              </Dialog.Title>
              <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-ink-soft">
                <X size={18} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-5 pb-7 pt-2 overflow-y-auto">
            <div>
              <label className={labelCls}>ชื่อหนี้ / บัตร</label>
              <input {...register('name')} className={inputCls} placeholder="เช่น KTC, Shopee" />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ยอดผ่อน/เดือน (฿)</label>
                <input {...register('monthlyPayment', { valueAsNumber: true })} type="number" step="0.01" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>ยอดคงเหลือ (฿)</label>
                <input {...register('totalBalance', { valueAsNumber: true })} type="number" step="0.01" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>จำนวนงวดผ่อนทั้งหมด (เดือน)</label>
              <div className="flex gap-2">
                <input {...register('totalMonths', { valueAsNumber: true })} type="number" min="0" step="1" className={inputCls} placeholder="0" />
                <button
                  type="button"
                  onClick={autoCalcMonths}
                  className="px-4 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center gap-1 text-xs font-semibold shrink-0 active:scale-95 transition-transform"
                >
                  <Wand2 size={14} /> คำนวณ
                </button>
              </div>
              <p className="text-[11px] text-ink-soft mt-1.5">กด "คำนวณ" เพื่อประมาณจาก ยอดหนี้ ÷ ยอดผ่อน/เดือน</p>
            </div>

            <div>
              <label className={labelCls}>หมายเหตุดอกเบี้ย</label>
              <input {...register('interestNote')} className={inputCls} placeholder="เช่น รอจ่ายดอกเบี้ย(800)" />
            </div>

            <div>
              <label className={labelCls}>สถานะ</label>
              <select {...register('status')} className={inputCls}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-semibold shadow-[0_8px_18px_-6px_rgba(59,110,244,0.6)] active:scale-[0.98] transition-transform mt-1"
            >
              บันทึก
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

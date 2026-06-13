'use client';
import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalCareSchema, type PersonalCareFormValues } from '@/schemas';
import type { PersonalCareItem, PersonalCareCategory } from '@/types';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: PersonalCareItem;
  defaultCategory?: PersonalCareCategory;
  onSave: (data: PersonalCareFormValues) => void;
}

const inputCls =
  'w-full bg-slate-100 rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand-300 transition';
const labelCls = 'text-[13px] font-semibold text-ink block mb-1.5';

export function PersonalCareFormDialog({ open, onOpenChange, editItem, defaultCategory = 'personal_items', onSave }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PersonalCareFormValues>({
    resolver: zodResolver(personalCareSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        editItem
          ? { name: editItem.name, category: editItem.category, monthlyInstallment: editItem.monthlyInstallment, monthlyTotal: editItem.monthlyTotal, originalPrice: editItem.originalPrice, total: editItem.total, budget: editItem.budget }
          : { name: '', category: defaultCategory, monthlyInstallment: 0, monthlyTotal: 0, originalPrice: 0, total: 0, budget: 0 },
      );
    }
  }, [open, editItem, defaultCategory, reset]);

  const onSubmit = (data: PersonalCareFormValues) => {
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
                {editItem ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}
              </Dialog.Title>
              <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-ink-soft">
                <X size={18} />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-5 pb-7 pt-2 overflow-y-auto">
            <div>
              <label className={labelCls}>ชื่อสินค้า</label>
              <input {...register('name')} className={inputCls} placeholder="เช่น เซรั่ม, ครีมกันแดด" />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelCls}>หมวดหมู่</label>
              <select {...register('category')} className={inputCls}>
                <option value="cosmetics">เครื่องสำอาง</option>
                <option value="personal_items">ของใช้ส่วนตัว</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ผ่อน/เดือน (฿)</label>
                <input {...register('monthlyInstallment', { valueAsNumber: true })} type="number" step="0.01" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>ยอด/เดือน (฿)</label>
                <input {...register('monthlyTotal', { valueAsNumber: true })} type="number" step="0.01" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>ราคาดัม (฿)</label>
                <input {...register('originalPrice', { valueAsNumber: true })} type="number" step="0.01" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>รวม (฿)</label>
                <input {...register('total', { valueAsNumber: true })} type="number" step="0.01" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>งบประมาณ (฿)</label>
              <input {...register('budget', { valueAsNumber: true })} type="number" step="0.01" className={inputCls} />
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

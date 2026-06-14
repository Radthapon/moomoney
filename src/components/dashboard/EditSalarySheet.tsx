'use client';
import { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useIncome } from '@/hooks/useIncome';
import { X, Wallet } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSalarySheet({ open, onOpenChange }: Props) {
  const { income, updateIncome } = useIncome();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.value = String(income?.salary ?? '');
      setTimeout(() => inputRef.current?.select(), 80);
    }
  }, [open, income?.salary]);

  const handleSave = async () => {
    const val = parseFloat(inputRef.current?.value ?? '');
    if (!isNaN(val) && val >= 0) {
      await updateIncome(val);
      onOpenChange(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-50" />
        <Dialog.Content className="fixed left-1/2 bottom-0 -translate-x-1/2 w-full max-w-[460px] bg-white rounded-t-[28px] z-50 animate-sheet pb-8">
          <div className="px-5 pt-3">
            <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-200 mb-4" />
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                  <Wallet size={18} className="text-brand-600" />
                </div>
                <Dialog.Title className="font-bold text-ink text-lg">แก้ไขเงินเดือน</Dialog.Title>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-ink-soft"
              >
                <X size={18} />
              </button>
            </div>

            <label className="text-[13px] font-semibold text-ink-soft block mb-2">เงินเดือน (฿)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-semibold select-none">฿</span>
              <input
                ref={inputRef}
                type="number"
                min="0"
                step="100"
                onKeyDown={handleKey}
                className="w-full bg-slate-100 rounded-2xl pl-9 pr-4 py-4 text-[22px] font-extrabold text-ink nums focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
              />
            </div>
            <p className="text-[11px] text-ink-soft mt-2 mb-5">อัปเดตทันที — ทุกยอดคำนวณจะปรับตามอัตโนมัติ</p>

            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-semibold shadow-[0_8px_18px_-6px_rgba(59,110,244,0.6)] active:scale-[0.98] transition-transform"
            >
              บันทึก
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

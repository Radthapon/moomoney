'use client';
import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { formatBaht } from '@/lib/formatters';
import { X, PiggyBank, Plus } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  availableSavings: number;
  currentAmount: number; // already added today (for editing)
  onConfirm: (amount: number) => Promise<void>;
}

export function AddFromSavingsSheet({ open, onOpenChange, availableSavings, currentAmount, onConfirm }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const maxAllowed = availableSavings + currentAmount; // can re-use amount already allocated today

  const handleConfirm = async () => {
    const val = parseFloat(inputRef.current?.value ?? '');
    if (isNaN(val) || val <= 0) { setError('กรอกจำนวนเงิน'); return; }
    if (val > maxAllowed) { setError(`ไม่เกิน ฿${formatBaht(maxAllowed)}`); return; }
    setError('');
    setLoading(true);
    await onConfirm(val);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-50" />
        <Dialog.Content className="fixed left-1/2 bottom-0 -translate-x-1/2 w-full max-w-[460px] bg-white rounded-t-[28px] z-50 animate-sheet">
          <div className="px-5 pt-3 pb-8">
            <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-200 mb-4" />

            <div className="flex justify-between items-center mb-5">
              <Dialog.Title className="font-bold text-ink text-lg">เพิ่มจากเงินออม</Dialog.Title>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-ink-soft"
              >
                <X size={18} />
              </button>
            </div>

            {/* Available balance */}
            <div className="bg-mint-500/10 rounded-2xl p-4 flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-mint-500/20 rounded-xl flex items-center justify-center shrink-0">
                <PiggyBank size={20} className="text-mint-600" />
              </div>
              <div>
                <p className="text-[11px] text-ink-soft">เงินออมที่ใช้ได้</p>
                <p className="nums font-extrabold text-mint-600 text-xl">฿{formatBaht(availableSavings)}</p>
              </div>
            </div>

            {/* Amount input */}
            <label className="text-[13px] font-semibold text-ink block mb-2">จำนวนที่ต้องการเพิ่มวันนี้ (฿)</label>
            <div className="relative mb-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft text-sm select-none">฿</span>
              <input
                ref={inputRef}
                type="number"
                min="1"
                max={maxAllowed}
                step="1"
                defaultValue={currentAmount > 0 ? currentAmount : ''}
                onKeyDown={(e) => { setError(''); if (e.key === 'Enter') handleConfirm(); }}
                onChange={() => setError('')}
                placeholder="0"
                className="w-full bg-slate-100 rounded-2xl pl-9 pr-4 py-3.5 text-base font-bold text-ink nums focus:outline-none focus:ring-2 focus:ring-mint-400 transition"
              />
            </div>
            {error && <p className="text-xs text-rose-500 mb-3">{error}</p>}
            {!error && <p className="text-[11px] text-ink-soft mb-4">สูงสุด ฿{formatBaht(maxAllowed)}</p>}

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-mint-500 text-white font-semibold shadow-[0_8px_18px_-6px_rgba(22,199,154,0.6)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Plus size={16} /> เพิ่มงบวันนี้
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

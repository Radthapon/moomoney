'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-50" />
        <Dialog.Content className="fixed left-1/2 bottom-0 -translate-x-1/2 w-full max-w-[460px] bg-white rounded-t-[28px] p-6 pb-8 z-50 animate-sheet">
          <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-200 mb-5" />
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-3">
              <Trash2 className="text-rose-500" size={24} />
            </div>
            <Dialog.Title className="font-bold text-ink text-lg">{title}</Dialog.Title>
            <Dialog.Description className="text-sm text-ink-soft mt-1">{description}</Dialog.Description>
          </div>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => { onConfirm(); onOpenChange(false); }}
              className="w-full py-3.5 text-sm font-semibold rounded-2xl bg-rose-500 text-white active:scale-[0.98] transition-transform"
            >
              ยืนยันลบ
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-3.5 text-sm font-semibold rounded-2xl bg-slate-100 text-ink-soft active:scale-[0.98] transition-transform"
            >
              ยกเลิก
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

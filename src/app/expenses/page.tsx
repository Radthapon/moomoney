'use client';
import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncome } from '@/hooks/useIncome';
import { ExpenseFormDialog } from '@/components/expenses/ExpenseFormDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { formatBaht, CATEGORY_LABELS } from '@/lib/formatters';
import type { MonthlyExpense } from '@/types';
import type { MonthlyExpenseFormValues } from '@/schemas';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_EMOJI: Record<string, string> = {
  housing: '🏠',
  food: '🍜',
  transport: '🚌',
  utilities: '💡',
  family: '👨‍👩‍👧',
  health: '💊',
  other: '🧺',
};

function SortableExpenseCard({
  item,
  onEdit,
  onDelete,
}: {
  item: MonthlyExpense;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id!,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overBudget = item.budget > 0 && item.amount > item.budget;
  const budgetPct = item.budget > 0 ? Math.min((item.amount / item.budget) * 100, 100) : 0;
  const isIncome = item.amount < 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-3xl p-4 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03] transition-shadow',
        isDragging && 'shadow-[0_20px_40px_-12px_rgba(27,34,48,0.35)] scale-[1.02] z-10 relative ring-brand-200',
      )}
    >
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 touch-none cursor-grab active:cursor-grabbing text-slate-300 active:text-ink-soft shrink-0"
          aria-label="ลากเพื่อเรียง"
        >
          <GripVertical size={18} />
        </button>

        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
          {CATEGORY_EMOJI[item.category]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink truncate">{item.name}</p>
          <span className="text-[11px] text-ink-soft">
            {CATEGORY_LABELS[item.category]}{item.note ? ` · ${item.note}` : ''}
          </span>
        </div>

        <div className="text-right shrink-0">
          <p className={cn('nums font-extrabold', isIncome ? 'text-mint-600' : 'text-ink')}>
            {isIncome ? '+' : ''}฿{formatBaht(Math.abs(item.amount))}
          </p>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-slate-100 text-ink-soft active:scale-90 transition-transform"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 active:scale-90 transition-transform"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {item.budget > 0 && (
        <div className="mt-3 ml-8">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-ink-soft">งบ ฿{formatBaht(item.budget)}</span>
            <span className={cn('font-semibold', overBudget ? 'text-rose-500' : 'text-mint-600')}>
              {overBudget ? 'เกินงบ' : `${budgetPct.toFixed(0)}%`}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', overBudget ? 'bg-rose-500' : 'bg-mint-500')}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, reorderExpenses } = useExpenses();
  const { income } = useIncome();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<MonthlyExpense | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const salary = income?.salary ?? 0;
  const pct = salary > 0 ? Math.min((total / salary) * 100, 100) : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = expenses.findIndex((e) => e.id === active.id);
    const newIndex = expenses.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(expenses, oldIndex, newIndex);
    reorderExpenses(reordered.map((e) => e.id!));
  };

  const handleSave = async (data: MonthlyExpenseFormValues) => {
    if (editItem?.id) await updateExpense(editItem.id, data);
    else await addExpense(data);
    setEditItem(undefined);
  };

  return (
    <div>
      <PageHeader
        title="ค่าใช้จ่ายประจำ"
        subtitle="รายจ่ายที่เกิดทุกเดือน"
        emoji="🧾"
        action={
          <button
            onClick={() => { setEditItem(undefined); setFormOpen(true); }}
            className="w-11 h-11 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-[0_8px_18px_-6px_rgba(59,110,244,0.6)] active:scale-95 transition-transform"
          >
            <Plus size={22} />
          </button>
        }
      />

      <div className="px-4 flex flex-col gap-3">
        {/* Summary */}
        <div className="bg-white rounded-[28px] p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[13px] text-ink-soft">รวมค่าใช้จ่ายเดือนนี้</p>
              <p className="nums text-[26px] font-extrabold text-ink leading-tight">฿{formatBaht(total)}</p>
            </div>
            {salary > 0 && <p className="text-xs text-ink-soft nums">/ ฿{formatBaht(salary)}</p>}
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', pct >= 100 ? 'bg-rose-500' : 'bg-brand-500')}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-ink-soft mt-1.5">{pct.toFixed(0)}% ของเงินเดือน</p>
        </div>

        {expenses.length === 0 ? (
          <EmptyState message="ยังไม่มีรายการค่าใช้จ่าย" />
        ) : (
          <>
            <p className="text-[11px] text-ink-soft px-1 flex items-center gap-1">
              <GripVertical size={13} /> กดค้างที่ ≡ แล้วลากเพื่อเรียงลำดับใหม่
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={expenses.map((e) => e.id!)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3">
                  {expenses.map((item) => (
                    <SortableExpenseCard
                      key={item.id}
                      item={item}
                      onEdit={() => { setEditItem(item); setFormOpen(true); }}
                      onDelete={() => setDeleteId(item.id!)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>

      <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} editItem={editItem} onSave={handleSave} />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบรายการค่าใช้จ่าย"
        description="คุณต้องการลบรายการนี้ใช่ไหม?"
        onConfirm={() => deleteId && deleteExpense(deleteId)}
      />
    </div>
  );
}

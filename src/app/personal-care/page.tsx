'use client';
import { useState } from 'react';
import { usePersonalCare } from '@/hooks/usePersonalCare';
import { PersonalCareFormDialog } from '@/components/personal-care/PersonalCareFormDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { formatBaht } from '@/lib/formatters';
import { computePersonalCareSummary } from '@/lib/calculations';
import type { PersonalCareItem, PersonalCareCategory } from '@/types';
import type { PersonalCareFormValues } from '@/schemas';
import { Plus, Pencil, Trash2 } from 'lucide-react';

function ItemCard({ item, onEdit, onDelete }: { item: PersonalCareItem; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03] flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink truncate">{item.name}</p>
        <p className="text-[11px] text-ink-soft nums mt-0.5">
          ยอด/เดือน ฿{formatBaht(item.monthlyTotal)}
          {item.total > 0 && ` · รวม ฿${formatBaht(item.total)}`}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="nums font-extrabold text-ink">฿{formatBaht(item.monthlyInstallment > 0 ? item.monthlyInstallment : item.monthlyTotal)}</p>
        <p className="text-[10px] text-ink-soft">/ เดือน</p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg bg-slate-100 text-ink-soft active:scale-90 transition-transform">
          <Pencil size={13} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 active:scale-90 transition-transform">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function CategorySection({
  title,
  emoji,
  items,
  category,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  emoji: string;
  items: PersonalCareItem[];
  category: PersonalCareCategory;
  onAdd: (c: PersonalCareCategory) => void;
  onEdit: (i: PersonalCareItem) => void;
  onDelete: (id: number) => void;
}) {
  const subtotal = items.reduce((s, i) => s + (i.monthlyInstallment > 0 ? i.monthlyInstallment : i.monthlyTotal), 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-[15px] font-bold text-ink flex items-center gap-1.5">{emoji} {title}</h2>
          <p className="text-[11px] text-ink-soft nums">รวม ฿{formatBaht(subtotal)}/เดือน</p>
        </div>
        <button
          onClick={() => onAdd(category)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-brand-500/10 text-brand-600 text-xs font-semibold active:scale-95 transition-transform"
        >
          <Plus size={14} /> เพิ่ม
        </button>
      </div>
      {items.length === 0 ? (
        <EmptyState message="ยังไม่มีรายการ" emoji="🧴" />
      ) : (
        items.map((item) => (
          <ItemCard key={item.id} item={item} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id!)} />
        ))
      )}
    </div>
  );
}

export default function PersonalCarePage() {
  const { items, cosmetics, personalItems, addItem, updateItem, deleteItem } = usePersonalCare();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<PersonalCareItem | undefined>();
  const [defaultCategory, setDefaultCategory] = useState<PersonalCareCategory>('personal_items');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const summary = computePersonalCareSummary(items);

  const handleAdd = (category: PersonalCareCategory) => {
    setEditItem(undefined);
    setDefaultCategory(category);
    setFormOpen(true);
  };
  const handleEdit = (item: PersonalCareItem) => {
    setEditItem(item);
    setFormOpen(true);
  };
  const handleSave = async (data: PersonalCareFormValues) => {
    if (editItem?.id) await updateItem(editItem.id, data);
    else await addItem(data);
    setEditItem(undefined);
  };

  return (
    <div>
      <PageHeader title="ของใช้ส่วนตัว" subtitle="เครื่องสำอางและของใช้ประจำ" emoji="🧴" />

      <div className="px-4 flex flex-col gap-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-3xl p-3.5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
            <p className="text-[11px] text-ink-soft">ผ่อนรวม/ด.</p>
            <p className="nums text-base font-extrabold text-ink mt-0.5">฿{formatBaht(summary.totalMonthlyInstallment)}</p>
          </div>
          <div className="bg-white rounded-3xl p-3.5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
            <p className="text-[11px] text-ink-soft">ยอดรวม/ด.</p>
            <p className="nums text-base font-extrabold text-brand-600 mt-0.5">฿{formatBaht(summary.totalMonthlyTotal)}</p>
          </div>
          <div className="bg-white rounded-3xl p-3.5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
            <p className="text-[11px] text-ink-soft">งบรวม</p>
            <p className="nums text-base font-extrabold text-mint-600 mt-0.5">฿{formatBaht(summary.totalBudget)}</p>
          </div>
        </div>

        <CategorySection title="เครื่องสำอาง" emoji="💄" items={cosmetics} category="cosmetics" onAdd={handleAdd} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />
        <CategorySection title="ของใช้ส่วนตัว" emoji="🧼" items={personalItems} category="personal_items" onAdd={handleAdd} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />
      </div>

      <PersonalCareFormDialog open={formOpen} onOpenChange={setFormOpen} editItem={editItem} defaultCategory={defaultCategory} onSave={handleSave} />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบรายการ"
        description="คุณต้องการลบรายการนี้ใช่ไหม?"
        onConfirm={() => deleteId && deleteItem(deleteId)}
      />
    </div>
  );
}

'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORY_LABELS, formatBaht } from '@/lib/formatters';
import type { MonthlyExpense } from '@/types';

const COLORS = ['#3b6ef4', '#16c79a', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#fb923c'];

interface Props {
  expenses: MonthlyExpense[];
}

export function ExpenseDonutChart({ expenses }: Props) {
  const grouped = expenses
    .filter((e) => e.amount > 0)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});

  const data = Object.entries(grouped)
    .map(([cat, value]) => ({ name: CATEGORY_LABELS[cat] ?? cat, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
      <h3 className="font-bold text-ink mb-2">สัดส่วนค่าใช้จ่าย</h3>
      <div className="flex items-center gap-2">
        <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`฿${formatBaht(Number(value))}`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-ink-soft">รวม</span>
            <span className="nums text-sm font-extrabold text-ink">฿{formatBaht(total)}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-ink">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </span>
              <span className="text-ink-soft nums">{Math.round((d.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

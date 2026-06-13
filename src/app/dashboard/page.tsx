'use client';
import dynamic from 'next/dynamic';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { useDebts } from '@/hooks/useDebts';
import { useExpenses } from '@/hooks/useExpenses';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ProgressRing } from '@/components/common/ProgressRing';
import { IncomeSummaryCard } from '@/components/dashboard/IncomeSummaryCard';
import { DebtProgressList } from '@/components/dashboard/DebtProgressList';
import { formatBaht } from '@/lib/formatters';

const ExpenseDonutChart = dynamic(
  () => import('@/components/dashboard/ExpenseDonutChart').then((m) => m.ExpenseDonutChart),
  { ssr: false },
);

export default function DashboardPage() {
  const { summary, isLoading } = useFinancialSummary();
  const { debts } = useDebts();
  const { expenses } = useExpenses();

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center h-64 text-ink-soft">กำลังโหลด...</div>;
  }

  const committed = summary.totalMonthlyExpenses + summary.totalDebtPayments;
  const committedPct = summary.salary > 0 ? Math.round((committed / summary.salary) * 100) : 0;
  const over = committedPct > 100;
  const ring =
    committedPct <= 85
      ? { from: '#34d8a6', to: '#16c79a' }
      : committedPct <= 100
        ? { from: '#fbbf24', to: '#f59e0b' }
        : { from: '#fb7185', to: '#f43f5e' };

  return (
    <div>
      <PageHeader title="หน้าหลัก" subtitle="ภาพรวมการเงินเดือนนี้" emoji="💰" />

      <div className="px-4 flex flex-col gap-3">
        {/* Hero balance card */}
        <div className="bg-white rounded-[28px] p-5 shadow-[0_12px_30px_-18px_rgba(27,34,48,0.4)] ring-1 ring-black/[0.03] flex items-center justify-between">
          <div>
            <p className="text-[13px] text-ink-soft">ยอดคงเหลือสุทธิ</p>
            <p className={`nums text-[32px] font-extrabold leading-tight mt-1 ${summary.netSalary >= 0 ? 'text-ink' : 'text-rose-500'}`}>
              ฿{formatBaht(summary.netSalary)}
            </p>
            <p className="text-xs text-ink-soft mt-1">
              จากเงินเดือน <span className="font-semibold text-ink">฿{formatBaht(summary.salary)}</span>
            </p>
          </div>
          <ProgressRing value={committedPct} size={108} stroke={11} from={ring.from} to={ring.to}>
            <span className={`nums text-xl font-extrabold ${over ? 'text-rose-500' : 'text-ink'}`}>{committedPct}%</span>
            <span className="text-[10px] text-ink-soft">ใช้ไป</span>
          </ProgressRing>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="เงินเดือน" value={summary.salary} colorVariant="neutral" emoji="🪙" />
          <StatCard title="ค่าใช้จ่ายรวม" value={summary.totalMonthlyExpenses} colorVariant="warning" emoji="🧾" />
          <StatCard title="ยอดผ่อนรวม" value={summary.totalDebtPayments} colorVariant="negative" emoji="💳" />
          <StatCard title="หลังปิดหนี้" value={summary.afterDebtClearMonthly} colorVariant="positive" emoji="🎯" subtitle="เหลือ/เดือน" />
        </div>

        <IncomeSummaryCard summary={summary} />
        <ExpenseDonutChart expenses={expenses} />
        <DebtProgressList debts={debts} />
      </div>
    </div>
  );
}

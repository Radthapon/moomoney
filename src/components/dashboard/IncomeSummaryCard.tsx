'use client';
import { formatBaht, colorClass } from '@/lib/formatters';
import type { FinancialSummary } from '@/types';

interface Props {
  summary: FinancialSummary;
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className={`text-sm ${muted ? 'text-ink-soft' : 'text-ink font-medium'}`}>{label}</span>
      <span className={`nums text-sm font-semibold ${colorClass(value)}`}>
        {value >= 0 ? '+' : ''}฿{formatBaht(value)}
      </span>
    </div>
  );
}

export function IncomeSummaryCard({ summary }: Props) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
      <h3 className="font-bold text-ink mb-1">สรุปรายรับ-รายจ่าย</h3>
      <div className="divide-y divide-slate-100">
        <Row label="เงินเดือน" value={summary.salary} muted />
        <Row label="ค่าใช้จ่ายประจำเดือน" value={-summary.totalMonthlyExpenses} muted />
        <Row label="ยอดผ่อนหนี้รวม" value={-summary.totalDebtPayments} muted />
      </div>
      <div className="mt-3 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
        <span className="font-bold text-ink">NET เงินเดือน</span>
        <span className={`nums text-xl font-extrabold ${colorClass(summary.netSalary)}`}>
          ฿{formatBaht(summary.netSalary)}
        </span>
      </div>
      <div className="mt-3 bg-mint-500/8 rounded-2xl px-4 py-3 flex justify-between items-center">
        <span className="text-xs text-ink-soft">หลังปิดหนี้ทั้งหมด เหลือ/เดือน</span>
        <span className="nums text-sm font-bold text-mint-600">฿{formatBaht(summary.afterDebtClearMonthly)}</span>
      </div>
    </div>
  );
}

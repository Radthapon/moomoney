'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Receipt, CalendarDays, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'หน้าหลัก', icon: LayoutDashboard },
  { href: '/debts', label: 'หนี้สิน', icon: CreditCard },
  { href: '/expenses', label: 'ค่าใช้จ่ายประจำ', icon: Receipt },
  { href: '/daily-budget', label: 'งบรายวัน', icon: CalendarDays },
  { href: '/personal-care', label: 'ของใช้ส่วนตัว', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-100 flex flex-col z-40">
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="text-lg font-bold text-slate-800">💰 บัญชีรายรับ</div>
        <div className="text-xs text-slate-400 mt-0.5">จัดการการเงินส่วนตัว</div>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 pl-2'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-slate-100 text-xs text-slate-400">
        ข้อมูลเก็บในเครื่องของคุณ
      </div>
    </aside>
  );
}

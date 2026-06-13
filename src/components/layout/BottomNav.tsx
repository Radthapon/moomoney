'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, CreditCard, Receipt, CalendarDays, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'หน้าหลัก', icon: LayoutGrid },
  { href: '/debts', label: 'หนี้สิน', icon: CreditCard },
  { href: '/expenses', label: 'รายจ่าย', icon: Receipt },
  { href: '/daily-budget', label: 'รายวัน', icon: CalendarDays },
  { href: '/personal-care', label: 'ของใช้', icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[460px] px-4 pb-4 pt-2 z-40 pointer-events-none">
      <div className="pointer-events-auto bg-white/95 backdrop-blur rounded-[26px] shadow-[0_10px_40px_-12px_rgba(27,34,48,0.28)] ring-1 ring-black/[0.03] flex items-center justify-between px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-[18px] px-2.5 py-2.5 transition-all duration-200',
                active
                  ? 'bg-brand-500 text-white shadow-[0_6px_16px_-4px_rgba(59,110,244,0.6)]'
                  : 'text-ink-soft active:scale-95',
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {active && <span className="text-[13px] font-semibold whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';
import { cn } from '@/lib/utils';
import { formatBaht } from '@/lib/formatters';

type ColorVariant = 'positive' | 'negative' | 'neutral' | 'warning' | 'auto';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  colorVariant?: ColorVariant;
  emoji?: string;
  prefix?: string;
}

const accent: Record<Exclude<ColorVariant, 'auto'>, { chip: string; value: string }> = {
  positive: { chip: 'bg-mint-500/10 text-mint-600', value: 'text-mint-600' },
  negative: { chip: 'bg-rose-500/10 text-rose-500', value: 'text-rose-500' },
  neutral: { chip: 'bg-brand-500/10 text-brand-600', value: 'text-ink' },
  warning: { chip: 'bg-amber-500/10 text-amber-600', value: 'text-amber-600' },
};

export function StatCard({ title, value, subtitle, colorVariant = 'neutral', emoji, prefix }: StatCardProps) {
  const resolved: Exclude<ColorVariant, 'auto'> =
    colorVariant === 'auto' ? (value >= 0 ? 'positive' : 'negative') : colorVariant;
  const a = accent[resolved];

  return (
    <div className="bg-white rounded-3xl p-4 shadow-[0_8px_24px_-16px_rgba(27,34,48,0.25)] ring-1 ring-black/[0.03]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[12px] font-medium text-ink-soft">{title}</span>
        {emoji && (
          <span className={cn('w-7 h-7 rounded-xl flex items-center justify-center text-sm', a.chip)}>
            {emoji}
          </span>
        )}
      </div>
      <div className={cn('text-[19px] font-extrabold nums leading-none', a.value)}>
        {prefix}฿{formatBaht(value)}
      </div>
      {subtitle && <div className="text-[11px] text-ink-soft mt-1.5">{subtitle}</div>}
    </div>
  );
}

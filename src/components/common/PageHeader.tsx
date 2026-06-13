interface Props {
  title: string;
  subtitle?: string;
  emoji?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, emoji, action }: Props) {
  return (
    <div className="flex items-start justify-between px-5 pt-7 pb-4">
      <div className="flex items-center gap-3">
        {emoji && (
          <div className="w-11 h-11 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.03] flex items-center justify-center text-xl">
            {emoji}
          </div>
        )}
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink leading-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-ink-soft mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

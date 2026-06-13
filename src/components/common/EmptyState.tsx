interface EmptyStateProps {
  message?: string;
  emoji?: string;
}

export function EmptyState({ message = 'ยังไม่มีข้อมูล', emoji = '📭' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl">{emoji}</div>
      <p className="text-sm text-ink-soft">{message}</p>
    </div>
  );
}

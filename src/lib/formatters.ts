export function formatBaht(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function colorClass(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-500';
  return 'text-slate-500';
}

export function bgColorClass(value: number): string {
  if (value > 0) return 'bg-green-50 border-green-200';
  if (value < 0) return 'bg-red-50 border-red-200';
  return 'bg-slate-50 border-slate-200';
}

export const CATEGORY_LABELS: Record<string, string> = {
  housing: 'ที่อยู่อาศัย',
  food: 'อาหาร',
  transport: 'เดินทาง',
  utilities: 'สาธารณูปโภค',
  family: 'ครอบครัว',
  health: 'สุขภาพ',
  other: 'อื่นๆ',
};

export const DEBT_STATUS_LABELS: Record<string, string> = {
  active: 'กำลังผ่อน',
  paid: 'ชำระแล้ว',
  pending_interest: 'รอดอกเบี้ย',
};

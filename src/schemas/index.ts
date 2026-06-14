import { z } from 'zod';

export const incomeSchema = z.object({
  salary: z.number().min(0, 'กรุณากรอกเงินเดือน'),
});

export const debtSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหนี้'),
  monthlyPayment: z.number().min(0),
  totalBalance: z.number().min(0),
  totalMonths: z.number().min(0),
  interestNote: z.string(),
  status: z.enum(['active', 'paid', 'pending_interest']),
});

export const monthlyExpenseSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อค่าใช้จ่าย'),
  amount: z.number(),
  budget: z.number().min(0),
  category: z.enum(['housing', 'food', 'transport', 'utilities', 'family', 'health', 'other']),
  note: z.string(),
});

export const dailyBudgetSchema = z.object({
  perMeal: z.number().min(0),
  dailyTransport: z.number().min(0),
});

export const personalCareSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  category: z.enum(['cosmetics', 'personal_items']),
  monthlyInstallment: z.number().min(0),
  monthlyTotal: z.number().min(0),
  originalPrice: z.number().min(0),
  total: z.number().min(0),
  budget: z.number().min(0),
});

export type IncomeFormValues = z.infer<typeof incomeSchema>;
export type DebtFormValues = z.infer<typeof debtSchema>;
export type MonthlyExpenseFormValues = z.infer<typeof monthlyExpenseSchema>;
export type DailyBudgetFormValues = z.infer<typeof dailyBudgetSchema>;
export type PersonalCareFormValues = z.infer<typeof personalCareSchema>;

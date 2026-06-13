export interface Income {
  id?: number;
  salary: number;
  updatedAt: Date;
}

export type DebtStatus = 'active' | 'paid' | 'pending_interest';

export interface Debt {
  id?: number;
  name: string;
  monthlyPayment: number;
  totalBalance: number;
  totalMonths: number;
  interestNote: string;
  status: DebtStatus;
  sortOrder: number;
  createdAt: Date;
}

export interface DebtPayment {
  id?: number;
  debtId: number;
  monthNumber: number;
  paid: boolean;
  paidAt?: Date;
}

export type ExpenseCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'family'
  | 'health'
  | 'other';

export interface MonthlyExpense {
  id?: number;
  name: string;
  amount: number;
  budget: number;
  category: ExpenseCategory;
  note: string;
  sortOrder: number;
  createdAt: Date;
}

export interface DailyBudget {
  id?: number;
  perMeal: number;
  dailyTransport: number;
  holidayFood: number;
  workdayTotal: number;
  rangeMin: number;
  rangeMax: number;
  updatedAt: Date;
}

export type PersonalCareCategory = 'cosmetics' | 'personal_items';

export interface PersonalCareItem {
  id?: number;
  name: string;
  category: PersonalCareCategory;
  monthlyInstallment: number;
  monthlyTotal: number;
  originalPrice: number;
  total: number;
  budget: number;
  sortOrder: number;
  createdAt: Date;
}

export interface FinancialSummary {
  salary: number;
  totalMonthlyExpenses: number;
  remainingAfterExpenses: number;
  totalDebtPayments: number;
  remainingAfterInstallments: number;
  netSalary: number;
  totalDebtBalance: number;
  afterDebtClearMonthly: number;
}

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
  /** days of week that have transport cost: 0=Sun 1=Mon … 6=Sat */
  transportDays: number[];
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

export interface DailySpendingEntry {
  id?: number;
  date: string; // 'YYYY-MM-DD' local date
  amount: number;
  note: string;
  createdAt: Date;
}

/** Per-day decision for what to do with surplus budget */
export interface DailyRolloverDecision {
  date: string; // 'YYYY-MM-DD', primary key
  mode: 'save' | 'rollover';
}

/** Extra budget injected from savings pool for a specific day */
export interface DailySavingsWithdrawal {
  date: string; // 'YYYY-MM-DD', primary key
  amount: number;
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

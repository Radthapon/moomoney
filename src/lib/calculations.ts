import type { Income, Debt, MonthlyExpense, PersonalCareItem, FinancialSummary } from '@/types';

export function computeFinancialSummary(
  income: Income | undefined,
  debts: Debt[],
  expenses: MonthlyExpense[],
): FinancialSummary {
  const salary = income?.salary ?? 0;
  const totalDebtPayments = debts
    .filter((d) => d.status !== 'paid')
    .reduce((sum, d) => sum + d.monthlyPayment, 0);
  const totalDebtBalance = debts.reduce((sum, d) => sum + d.totalBalance, 0);
  const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingAfterExpenses = salary - totalMonthlyExpenses;
  const remainingAfterInstallments = remainingAfterExpenses - totalDebtPayments;
  const netSalary = remainingAfterInstallments;
  const afterDebtClearMonthly = salary - totalMonthlyExpenses + totalDebtPayments;

  return {
    salary,
    totalMonthlyExpenses,
    remainingAfterExpenses,
    totalDebtPayments,
    remainingAfterInstallments,
    netSalary,
    totalDebtBalance,
    afterDebtClearMonthly,
  };
}

export function computePersonalCareSummary(items: PersonalCareItem[]) {
  const totalMonthlyInstallment = items.reduce((s, i) => s + i.monthlyInstallment, 0);
  const totalBudget = items.reduce((s, i) => s + i.budget, 0);
  const totalMonthlyTotal = items.reduce((s, i) => s + i.monthlyTotal, 0);
  return { totalMonthlyInstallment, totalBudget, totalMonthlyTotal };
}

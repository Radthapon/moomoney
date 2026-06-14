import Dexie, { type Table } from 'dexie';
import type { Income, Debt, MonthlyExpense, DailyBudget, PersonalCareItem, DebtPayment, DailySpendingEntry, DailyRolloverDecision, DailySavingsWithdrawal } from '@/types';

export class FinanceDB extends Dexie {
  income!: Table<Income>;
  debts!: Table<Debt>;
  monthlyExpenses!: Table<MonthlyExpense>;
  dailyBudget!: Table<DailyBudget>;
  personalCareItems!: Table<PersonalCareItem>;
  debtPayments!: Table<DebtPayment>;
  dailySpendingEntries!: Table<DailySpendingEntry>;
  dailyRollovers!: Table<DailyRolloverDecision>;
  dailySavingsWithdrawals!: Table<DailySavingsWithdrawal>;

  constructor() {
    super('ThaiFinanceDB');
    this.version(1).stores({
      income: '++id',
      debts: '++id, status, sortOrder',
      monthlyExpenses: '++id, category, sortOrder',
      dailyBudget: '++id',
      personalCareItems: '++id, category, sortOrder',
    });
    this.version(2).stores({
      income: '++id',
      debts: '++id, status, sortOrder',
      monthlyExpenses: '++id, category, sortOrder',
      dailyBudget: '++id',
      personalCareItems: '++id, category, sortOrder',
      debtPayments: '++id, debtId, [debtId+monthNumber]',
    }).upgrade(tx => {
      return tx.table('debts').toCollection().modify((debt: Debt) => {
        if (!debt.totalMonths) {
          debt.totalMonths = debt.monthlyPayment > 0
            ? Math.ceil(debt.totalBalance / debt.monthlyPayment)
            : 0;
        }
      });
    });
    this.version(3).stores({
      income: '++id',
      debts: '++id, status, sortOrder',
      monthlyExpenses: '++id, category, sortOrder',
      dailyBudget: '++id',
      personalCareItems: '++id, category, sortOrder',
      debtPayments: '++id, debtId, [debtId+monthNumber]',
      dailySpendingEntries: '++id, date',
    });
    this.version(4).stores({
      income: '++id',
      debts: '++id, status, sortOrder',
      monthlyExpenses: '++id, category, sortOrder',
      dailyBudget: '++id',
      personalCareItems: '++id, category, sortOrder',
      debtPayments: '++id, debtId, [debtId+monthNumber]',
      dailySpendingEntries: '++id, date',
      dailyRollovers: 'date',
    });
    this.version(5).stores({
      income: '++id',
      debts: '++id, status, sortOrder',
      monthlyExpenses: '++id, category, sortOrder',
      dailyBudget: '++id',
      personalCareItems: '++id, category, sortOrder',
      debtPayments: '++id, debtId, [debtId+monthNumber]',
      dailySpendingEntries: '++id, date',
      dailyRollovers: 'date',
      dailySavingsWithdrawals: 'date', // date as primary key — upsert via put()
    });
  }
}

export const db = new FinanceDB();

export async function seedDefaultData() {
  if (localStorage.getItem('moo_seeded') === '1') return;

  localStorage.setItem('moo_seeded', '1');

  await db.income.put({ id: 1, salary: 25700, updatedAt: new Date() });

  await db.debts.bulkAdd([
    { name: 'Shopee', monthlyPayment: 7800, totalBalance: 60000, totalMonths: 8, interestNote: '652 จ่ายแล้ว', status: 'active', sortOrder: 0, createdAt: new Date() },
    { name: 'KTC', monthlyPayment: 3000, totalBalance: 30000, totalMonths: 10, interestNote: 'รอจ่ายดอกเบี้ย(800)', status: 'pending_interest', sortOrder: 1, createdAt: new Date() },
    { name: 'SCB', monthlyPayment: 2000, totalBalance: 20300, totalMonths: 11, interestNote: 'รอยอดดอกเบี้ย(200)', status: 'pending_interest', sortOrder: 2, createdAt: new Date() },
    { name: 'Uchose', monthlyPayment: 1000, totalBalance: 9000, totalMonths: 9, interestNote: '', status: 'active', sortOrder: 3, createdAt: new Date() },
    { name: 'กรุงไทย', monthlyPayment: 1200, totalBalance: 10800, totalMonths: 9, interestNote: '', status: 'active', sortOrder: 4, createdAt: new Date() },
    { name: 'ผ่อนโทรศัพท์', monthlyPayment: 900, totalBalance: 5840, totalMonths: 7, interestNote: '', status: 'active', sortOrder: 5, createdAt: new Date() },
    { name: 'KBANK', monthlyPayment: 2250, totalBalance: 63000, totalMonths: 28, interestNote: '', status: 'active', sortOrder: 6, createdAt: new Date() },
  ]);

  await db.monthlyExpenses.bulkAdd([
    { name: 'ห้อง', amount: 4700, budget: 4700, category: 'housing', note: '', sortOrder: 0, createdAt: new Date() },
    { name: 'เน็ต', amount: 550, budget: 550, category: 'utilities', note: '', sortOrder: 1, createdAt: new Date() },
    { name: 'Fluck', amount: -520, budget: 2500, category: 'family', note: 'ค่อยให้', sortOrder: 2, createdAt: new Date() },
    { name: 'ผ่อนของเดือน', amount: 2260, budget: 2500, category: 'other', note: '', sortOrder: 3, createdAt: new Date() },
    { name: 'แม่', amount: 2000, budget: 2000, category: 'family', note: '', sortOrder: 4, createdAt: new Date() },
    { name: 'ค่ากิน', amount: 6750, budget: 6750, category: 'food', note: '', sortOrder: 5, createdAt: new Date() },
    { name: 'เดินทาง', amount: 1800, budget: 1800, category: 'transport', note: '', sortOrder: 6, createdAt: new Date() },
    { name: 'ยา', amount: 400, budget: 400, category: 'health', note: '', sortOrder: 7, createdAt: new Date() },
    { name: 'น้ำ', amount: 200, budget: 200, category: 'utilities', note: '', sortOrder: 8, createdAt: new Date() },
    { name: 'แคนดี้', amount: 400, budget: 400, category: 'other', note: '', sortOrder: 9, createdAt: new Date() },
  ]);

  await db.dailyBudget.put({
    id: 1,
    perMeal: 75,
    dailyTransport: 75,
    transportDays: [1, 2, 3, 4, 5], // Mon–Fri
    updatedAt: new Date(),
  });

  await db.personalCareItems.bulkAdd([
    { name: 'บลัชออน', category: 'cosmetics', monthlyInstallment: 0, monthlyTotal: 50, originalPrice: 150, total: 150, budget: 0, sortOrder: 0, createdAt: new Date() },
    { name: 'พาเลทตา', category: 'cosmetics', monthlyInstallment: 0, monthlyTotal: 75, originalPrice: 150, total: 150, budget: 0, sortOrder: 1, createdAt: new Date() },
    { name: 'คุชชั่น', category: 'cosmetics', monthlyInstallment: 0, monthlyTotal: 100, originalPrice: 100, total: 100, budget: 0, sortOrder: 2, createdAt: new Date() },
    { name: 'มาสคาร่า', category: 'cosmetics', monthlyInstallment: 0, monthlyTotal: 60, originalPrice: 180, total: 180, budget: 0, sortOrder: 3, createdAt: new Date() },
    { name: 'ไพร์เมอร์', category: 'cosmetics', monthlyInstallment: 0, monthlyTotal: 180, originalPrice: 180, total: 180, budget: 0, sortOrder: 4, createdAt: new Date() },
    { name: 'เซรั่ม', category: 'personal_items', monthlyInstallment: 166.67, monthlyTotal: 166.67, originalPrice: 500, total: 500, budget: 0, sortOrder: 0, createdAt: new Date() },
    { name: 'มอยซ์เจอร์ไรเซอร์', category: 'personal_items', monthlyInstallment: 150, monthlyTotal: 150, originalPrice: 300, total: 300, budget: 0, sortOrder: 1, createdAt: new Date() },
    { name: 'ครีมกันแดด', category: 'personal_items', monthlyInstallment: 165, monthlyTotal: 165, originalPrice: 660, total: 660, budget: 0, sortOrder: 2, createdAt: new Date() },
    { name: 'ที่ล้างจุดซ่อนเร้น', category: 'personal_items', monthlyInstallment: 115, monthlyTotal: 115, originalPrice: 230, total: 230, budget: 0, sortOrder: 3, createdAt: new Date() },
    { name: 'น้ำตบ', category: 'personal_items', monthlyInstallment: 70, monthlyTotal: 70, originalPrice: 350, total: 350, budget: 0, sortOrder: 4, createdAt: new Date() },
    { name: 'ลิปบาล์ม', category: 'personal_items', monthlyInstallment: 100, monthlyTotal: 100, originalPrice: 300, total: 300, budget: 0, sortOrder: 5, createdAt: new Date() },
    { name: 'คลีนซิ่ง', category: 'personal_items', monthlyInstallment: 100, monthlyTotal: 100, originalPrice: 200, total: 200, budget: 0, sortOrder: 6, createdAt: new Date() },
    { name: 'ครีมอาบน้ำ', category: 'personal_items', monthlyInstallment: 130, monthlyTotal: 130, originalPrice: 130, total: 130, budget: 0, sortOrder: 7, createdAt: new Date() },
    { name: 'ยาสระผม', category: 'personal_items', monthlyInstallment: 175, monthlyTotal: 175, originalPrice: 350, total: 350, budget: 0, sortOrder: 8, createdAt: new Date() },
    { name: 'โฟมล้างหน้า', category: 'personal_items', monthlyInstallment: 130, monthlyTotal: 130, originalPrice: 260, total: 260, budget: 0, sortOrder: 9, createdAt: new Date() },
    { name: 'ยาสีฟัน', category: 'personal_items', monthlyInstallment: 100, monthlyTotal: 100, originalPrice: 100, total: 100, budget: 0, sortOrder: 10, createdAt: new Date() },
    { name: 'ครีมทาผิว', category: 'personal_items', monthlyInstallment: 60, monthlyTotal: 60, originalPrice: 120, total: 120, budget: 0, sortOrder: 11, createdAt: new Date() },
    { name: 'แป้ง', category: 'personal_items', monthlyInstallment: 100, monthlyTotal: 100, originalPrice: 100, total: 100, budget: 0, sortOrder: 12, createdAt: new Date() },
    { name: 'น้ำหอม', category: 'personal_items', monthlyInstallment: 150, monthlyTotal: 150, originalPrice: 600, total: 600, budget: 0, sortOrder: 13, createdAt: new Date() },
    { name: 'เซรั่มใส่ผม', category: 'personal_items', monthlyInstallment: 83.33, monthlyTotal: 83.33, originalPrice: 250, total: 250, budget: 0, sortOrder: 14, createdAt: new Date() },
  ]);
}

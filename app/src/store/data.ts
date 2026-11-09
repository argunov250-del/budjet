import { defaultCategories, defaultSettings } from './defaults';
import type { Account, Category, Goal, Settings, Transaction } from './types';

/** Persisted / exportable slice of the store. */
export type BudgetData = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  settings: Settings;
  lastAccountId: string | null;
};

export const STORE_VERSION = 2;

export const emptyData = (): BudgetData => ({
  accounts: [],
  categories: defaultCategories.map((c) => ({ ...c })),
  transactions: [],
  goals: [],
  settings: { ...defaultSettings },
  lastAccountId: null,
});

const isObj = (x: unknown): x is Record<string, any> => !!x && typeof x === 'object' && !Array.isArray(x);
const num = (x: unknown, d = 0) => (typeof x === 'number' && Number.isFinite(x) ? x : d);
const str = (x: unknown, d = '') => (typeof x === 'string' ? x : d);

/** Validates + normalizes untrusted data (import / old persisted state). Returns null if unusable. */
export function sanitizeData(raw: unknown): BudgetData | null {
  if (!isObj(raw) || !Array.isArray(raw.accounts) || !Array.isArray(raw.transactions)) return null;
  const base = emptyData();
  const accounts: Account[] = raw.accounts.filter(isObj).filter((a) => typeof a.id === 'string' && a.id).map((a) => ({
    id: a.id, name: str(a.name, 'Счёт'),
    type: ['card', 'cash', 'savings', 'other'].includes(a.type) ? a.type : 'other',
    initialBalance: num(a.initialBalance), color: str(a.color, '#0B3D91'), icon: str(a.icon, '💳'), archived: !!a.archived,
  }));
  const ids = new Set(accounts.map((a) => a.id));
  const transactions: Transaction[] = raw.transactions.filter(isObj)
    .filter((t) => typeof t.id === 'string' && ids.has(t.accountId) && num(t.amount) > 0 && !Number.isNaN(Date.parse(t.date)))
    .map((t) => ({
      id: t.id,
      kind: ['expense', 'income', 'transfer'].includes(t.kind) ? t.kind : 'expense',
      amount: num(t.amount), categoryId: str(t.categoryId), note: str(t.note), date: t.date, accountId: t.accountId,
      ...(t.kind === 'transfer' && ids.has(t.toAccountId) ? { toAccountId: t.toAccountId } : {}),
    }))
    .filter((t) => t.kind !== 'transfer' || t.toAccountId);
  let categories = base.categories;
  if (Array.isArray(raw.categories) && raw.categories.length) {
    categories = raw.categories.filter(isObj).filter((c) => typeof c.id === 'string').map((c) => ({
      id: c.id, name: str(c.name, 'Категория'), icon: c.icon ?? 'tag', color: str(c.color, '#7488A6'), monthlyLimit: Math.max(0, num(c.monthlyLimit)),
    }));
    if (!categories.length) categories = base.categories;
  }
  const goals: Goal[] = Array.isArray(raw.goals)
    ? raw.goals.filter(isObj).filter((g) => typeof g.id === 'string').map((g) => ({
        id: g.id, name: str(g.name, 'Цель'), target: Math.max(0, num(g.target)), saved: Math.max(0, num(g.saved)), emoji: typeof g.emoji === 'string' ? g.emoji : undefined,
      }))
    : [];
  const s = isObj(raw.settings) ? raw.settings : {};
  const settings: Settings = {
    monthlyIncome: Math.max(0, num(s.monthlyIncome)),
    payday: Math.min(31, Math.max(1, Math.round(num(s.payday, 1)))),
    fixedExpenses: Math.max(0, num(s.fixedExpenses)),
    monthlyBudget: Math.max(0, num(s.monthlyBudget)),
    theme: ['system', 'light', 'dark'].includes(s.theme) ? s.theme : 'system',
  };
  const last = ids.has(raw.lastAccountId) ? raw.lastAccountId : accounts.find((a) => !a.archived)?.id ?? null;
  return { accounts, categories, transactions, goals, settings, lastAccountId: last };
}

export function exportJson(d: BudgetData): string {
  return JSON.stringify({ app: 'rovno', version: STORE_VERSION, ...d }, null, 2);
}

export function parseImport(text: string): BudgetData | null {
  try {
    return sanitizeData(JSON.parse(text));
  } catch {
    return null;
  }
}

/** zustand persist migrate: anything from before v2 (demo data, no accounts) is wiped. */
export function migrateState(persisted: unknown, version: number): BudgetData {
  if (version < STORE_VERSION) return emptyData();
  return sanitizeData(persisted) ?? emptyData();
}

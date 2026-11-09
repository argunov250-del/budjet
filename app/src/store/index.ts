import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ACCOUNT_COLORS, ACCOUNT_TYPES } from './defaults';
import { STORE_VERSION, emptyData, migrateState, type BudgetData } from './data';
import type { Account, Goal, NewAccount, NewTransaction, Settings, Transaction } from './types';

export * from './types';
export * from './defaults';
export * from './data';

export type BudgetState = BudgetData & {
  addTransaction: (t: NewTransaction) => Transaction;
  removeTransaction: (id: string) => void;
  addAccount: (a: NewAccount) => Account;
  updateAccount: (id: string, patch: Partial<Omit<Account, 'id'>>) => void;
  setAccountArchived: (id: string, archived: boolean) => void;
  setCategoryLimit: (id: string, limit: number) => void;
  addGoal: (g: { name: string; target: number; saved?: number; emoji?: string }) => Goal;
  depositToGoal: (id: string, amount: number) => void;
  updateSettings: (s: Partial<Settings>) => void;
  /** replace all data (import) */
  replaceData: (d: BudgetData) => void;
  /** wipe everything -> empty state (onboarding shows again) */
  reset: () => void;
};

let counter = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      ...emptyData(),
      addTransaction: (t) => {
        const s = get();
        const active = s.accounts.filter((a) => !a.archived);
        const accountId =
          t.accountId ?? (s.accounts.some((a) => a.id === s.lastAccountId) ? s.lastAccountId! : active[0]?.id ?? s.accounts[0]?.id ?? '');
        const kind = t.kind ?? 'expense';
        const tx: Transaction = {
          id: uid('tx'),
          kind,
          amount: Math.abs(t.amount),
          categoryId: kind === 'transfer' ? '' : t.categoryId ?? 'other',
          note: t.note,
          date: t.date ?? new Date().toISOString(),
          accountId,
          ...(kind === 'transfer' && t.toAccountId ? { toAccountId: t.toAccountId } : {}),
        };
        set((st) => ({ transactions: [tx, ...st.transactions], lastAccountId: accountId || st.lastAccountId }));
        return tx;
      },
      removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),
      addAccount: (a) => {
        const type = a.type ?? 'card';
        const acc: Account = {
          id: uid('acc'),
          name: a.name.trim() || 'Счёт',
          type,
          initialBalance: a.initialBalance ?? 0,
          color: a.color ?? ACCOUNT_COLORS[get().accounts.length % ACCOUNT_COLORS.length],
          icon: a.icon ?? ACCOUNT_TYPES.find((x) => x.type === type)?.icon ?? '💳',
          archived: false,
        };
        set((s) => ({ accounts: [...s.accounts, acc], lastAccountId: s.lastAccountId ?? acc.id }));
        return acc;
      },
      updateAccount: (id, patch) => set((s) => ({ accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      setAccountArchived: (id, archived) =>
        set((s) => {
          const accounts = s.accounts.map((a) => (a.id === id ? { ...a, archived } : a));
          const lastOk = accounts.find((a) => a.id === s.lastAccountId && !a.archived);
          return { accounts, lastAccountId: lastOk ? s.lastAccountId : accounts.find((a) => !a.archived)?.id ?? s.lastAccountId };
        }),
      setCategoryLimit: (id, limit) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, monthlyLimit: Math.max(0, limit) } : c)) })),
      addGoal: (g) => {
        const goal: Goal = { id: uid('goal'), name: g.name, target: g.target, saved: g.saved ?? 0, emoji: g.emoji };
        set((s) => ({ goals: [...s.goals, goal] }));
        return goal;
      },
      depositToGoal: (id, amount) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g)) })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      replaceData: (d) => set({ ...d }),
      reset: () => set({ ...emptyData() }),
    }),
    {
      name: 'rovno-store-v1',
      version: STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        accounts: s.accounts, categories: s.categories, transactions: s.transactions, goals: s.goals,
        settings: s.settings, lastAccountId: s.lastAccountId,
      }),
      migrate: (persisted, version) => migrateState(persisted, version),
    },
  ),
);

/** true once the persisted state has been loaded from storage */
export function useHydrated(): boolean {
  const [h, setH] = useState(() => useBudgetStore.persist.hasHydrated());
  useEffect(() => {
    const un = useBudgetStore.persist.onFinishHydration(() => setH(true));
    setH(useBudgetStore.persist.hasHydrated());
    return un;
  }, []);
  return h;
}

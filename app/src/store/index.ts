import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { makeSeedTransactions, seedCategories, seedGoals, seedSettings } from './seed';
import type { Category, Goal, NewTransaction, Settings, Transaction } from './types';

export * from './types';
export * from './seed';

export type BudgetState = {
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  settings: Settings;
  addTransaction: (t: NewTransaction) => Transaction;
  removeTransaction: (id: string) => void;
  addGoal: (g: { name: string; target: number; saved?: number; emoji?: string }) => Goal;
  depositToGoal: (id: string, amount: number) => void;
  updateSettings: (s: Partial<Settings>) => void;
  /** restore seed data */
  reset: () => void;
};

let counter = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const initial = () => ({
  categories: seedCategories,
  transactions: makeSeedTransactions(),
  goals: seedGoals,
  settings: seedSettings,
});

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      ...initial(),
      addTransaction: (t) => {
        const tx: Transaction = {
          id: uid('tx'),
          amount: Math.abs(t.amount),
          categoryId: t.categoryId,
          note: t.note,
          date: t.date ?? new Date().toISOString(),
        };
        set((s) => ({ transactions: [tx, ...s.transactions] }));
        return tx;
      },
      removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),
      addGoal: (g) => {
        const goal: Goal = { id: uid('goal'), name: g.name, target: g.target, saved: g.saved ?? 0, emoji: g.emoji };
        set((s) => ({ goals: [...s.goals, goal] }));
        return goal;
      },
      depositToGoal: (id, amount) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g)) })),
      updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      reset: () => set(initial()),
    }),
    {
      name: 'rovno-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ categories: s.categories, transactions: s.transactions, goals: s.goals, settings: s.settings }),
    },
  ),
);

import type { AccountType, Category, Settings } from './types';

export const OTHER_CATEGORY_ID = 'other';
export const INCOME_OTHER_ID = 'inc-other';

/** Expense categories (user may edit their monthly limits; 0 = no limit). */
export const defaultCategories: Category[] = [
  { id: 'groceries', name: 'Продукты', icon: 'cart', color: '#0B3D91', monthlyLimit: 0 },
  { id: 'kids', name: 'Дети', icon: 'kid', color: '#6C93E8', monthlyLimit: 0 },
  { id: 'cafe', name: 'Кафе', icon: 'coffee', color: '#FF6A2B', monthlyLimit: 0 },
  { id: 'transport', name: 'Транспорт', icon: 'car', color: '#1FA971', monthlyLimit: 0 },
  { id: 'home', name: 'Дом', icon: 'home', color: '#8B6CE8', monthlyLimit: 0 },
  { id: 'health', name: 'Здоровье', icon: 'heart', color: '#E8456B', monthlyLimit: 0 },
  { id: 'fun', name: 'Развлечения', icon: 'ticket', color: '#FFA05C', monthlyLimit: 0 },
  { id: 'subs', name: 'Подписки', icon: 'repeat', color: '#4FB6C9', monthlyLimit: 0 },
  { id: OTHER_CATEGORY_ID, name: 'Другое', icon: 'tag', color: '#7488A6', monthlyLimit: 0 },
];

/** Income categories (fixed, not part of the store state). */
export const incomeCategories: Category[] = [
  { id: 'inc-salary', name: 'Зарплата', icon: 'house', color: '#1FA971', monthlyLimit: 0 },
  { id: 'inc-side', name: 'Подработка', icon: 'sparkles', color: '#4FB6C9', monthlyLimit: 0 },
  { id: INCOME_OTHER_ID, name: 'Другое', icon: 'tag', color: '#7488A6', monthlyLimit: 0 },
];

export const defaultSettings: Settings = { monthlyIncome: 0, payday: 1, fixedExpenses: 0, monthlyBudget: 0, theme: 'system' };

export const ACCOUNT_TYPES: { type: AccountType; label: string; icon: string }[] = [
  { type: 'card', label: 'Карта', icon: '💳' },
  { type: 'cash', label: 'Наличные', icon: '💵' },
  { type: 'savings', label: 'Накопления', icon: '🏦' },
  { type: 'other', label: 'Другое', icon: '👛' },
];

export const ACCOUNT_COLORS = ['#0B3D91', '#FF6A2B', '#1FA971', '#8B6CE8', '#E8456B', '#4FB6C9'];

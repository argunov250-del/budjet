import type { Category, Goal, Settings, Transaction } from './types';

export const OTHER_CATEGORY_ID = 'other';

export const seedCategories: Category[] = [
  { id: 'groceries', name: 'Продукты', icon: 'cart', color: '#0B3D91', monthlyLimit: 14000 },
  { id: 'kids', name: 'Дети', icon: 'kid', color: '#6C93E8', monthlyLimit: 9000 },
  { id: 'cafe', name: 'Кафе', icon: 'coffee', color: '#FF6A2B', monthlyLimit: 7000 },
  { id: 'transport', name: 'Транспорт', icon: 'car', color: '#1FA971', monthlyLimit: 6000 },
  { id: 'home', name: 'Дом', icon: 'home', color: '#8B6CE8', monthlyLimit: 5000 },
  { id: 'health', name: 'Здоровье', icon: 'heart', color: '#E8456B', monthlyLimit: 4000 },
  { id: 'fun', name: 'Развлечения', icon: 'ticket', color: '#FFA05C', monthlyLimit: 5000 },
  { id: 'subs', name: 'Подписки', icon: 'repeat', color: '#4FB6C9', monthlyLimit: 2000 },
  { id: OTHER_CATEGORY_ID, name: 'Другое', icon: 'tag', color: '#7488A6', monthlyLimit: 3000 },
];

export const seedSettings: Settings = { monthlyIncome: 95000, payday: 5, fixedExpenses: 40000 };

type T = [day: number, hour: number, min: number, categoryId: string, note: string, amount: number];
const template: T[] = [
  [1, 9, 10, 'transport', 'Метро', 65],
  [1, 13, 5, 'cafe', 'Обед', 540],
  [1, 19, 40, 'groceries', 'Пятёрочка', 1860],
  [2, 8, 45, 'transport', 'Метро', 65],
  [2, 12, 30, 'subs', 'Яндекс Плюс', 299],
  [2, 18, 20, 'kids', 'Детский центр', 900],
  [3, 10, 0, 'health', 'Аптека', 760],
  [3, 15, 15, 'groceries', 'ВкусВилл', 1420],
  [3, 21, 5, 'fun', 'Кино', 700],
  [4, 8, 50, 'transport', 'Метро', 65],
  [4, 13, 20, 'cafe', 'Surf Coffee', 320],
  [4, 17, 30, 'home', 'Хозтовары', 980],
  [5, 9, 5, 'transport', 'Такси', 480],
  [5, 14, 10, 'groceries', 'Перекрёсток', 2310],
  [5, 19, 0, 'kids', 'Игрушки', 1150],
  [6, 12, 40, 'cafe', 'Кофе', 250],
  [6, 16, 20, 'subs', 'Музыка', 199],
  [6, 20, 10, 'other', 'Подарок', 1200],
  [7, 8, 45, 'transport', 'Метро', 65],
  [7, 11, 30, 'groceries', 'Рынок', 1240],
  [7, 18, 20, 'kids', 'Кружок', 1600],
  [7, 21, 30, 'cafe', 'Ужин', 1380],
  [8, 8, 40, 'transport', 'Метро', 65],
  [8, 9, 30, 'cafe', 'Кофе', 250],
  [8, 10, 15, 'groceries', 'Хлеб и молоко', 380],
];

export function makeSeedTransactions(now: Date = new Date()): Transaction[] {
  const today = now.getDate();
  const out: Transaction[] = [];
  template.forEach(([day, h, m, categoryId, note, amount], i) => {
    const d = Math.min(day, today);
    const date = new Date(now.getFullYear(), now.getMonth(), d, h, m, 0);
    // never put seed transactions in the future
    if (date.getTime() > now.getTime()) date.setTime(now.getTime() - (template.length - i) * 60000);
    out.push({ id: `seed-${i + 1}`, amount, categoryId, note, date: date.toISOString() });
  });
  return out;
}

export const seedGoals: Goal[] = [
  { id: 'goal-trip', name: 'Отпуск с детьми', target: 180000, saved: 64000, emoji: '🏖️' },
  { id: 'goal-cushion', name: 'Подушка безопасности', target: 300000, saved: 112000, emoji: '🛟' },
];

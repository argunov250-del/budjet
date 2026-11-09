import {
  accountBalance, totalBalance, monthBudget, categorySpent, dailyLimit, monthSeries, parseQuickInput, spentToday, leftToday, streak, daysLeft, daysInMonth,
} from '../budget';
import type { Transaction } from '../../store/types';
import { defaultCategories as seedCategories } from '../../store/defaults';
import { emptyData, migrateState, parseImport, exportJson } from '../../store/data';

const settings = { monthlyIncome: 70000, payday: 5, fixedExpenses: 40000, monthlyBudget: 0, theme: 'system' as const }; // budget 30000, Nov = 30 days => 1000/day
const now = new Date(2026, 10, 8, 12, 0); // 8 Nov, 23 days left incl. today
let n = 0;
const tx = (day: number, amount: number, categoryId = 'cafe', month = 10): Transaction => ({
  id: `t${n++}`, kind: 'expense', accountId: 'a1', amount, categoryId, note: 'x', date: new Date(2026, month, day, 10, 0).toISOString(),
});

test('days helpers', () => {
  expect(daysInMonth(now)).toBe(30);
  expect(daysLeft(now)).toBe(23);
});

test('dailyLimit: no spending -> budget / days left, breakdown sums', () => {
  const d = dailyLimit([], settings, now);
  expect(d.limit).toBe(Math.round(30000 / 23));
  expect(d.base + d.savedYesterday).toBe(d.limit);
  expect(d.daysLeft).toBe(23);
});

test('dailyLimit: spending before today reduces limit; saved yesterday positive when underspent', () => {
  const txs = [tx(1, 5000), tx(7, 100)];
  const d = dailyLimit(txs, settings, now);
  expect(d.remaining).toBe(24900);
  expect(d.limit).toBe(Math.round(24900 / 23));
  expect(d.savedYesterday).toBeGreaterThan(0);
  expect(d.base + d.savedYesterday).toBe(d.limit);
});

test('dailyLimit: overspend yesterday gives negative carry-over', () => {
  const d = dailyLimit([tx(7, 6000)], settings, now);
  expect(d.savedYesterday).toBeLessThan(0);
});

test('spentToday / leftToday ignore other days and months', () => {
  const txs = [tx(8, 300), tx(8, 200), tx(7, 999), tx(8, 5000, 'cafe', 9)];
  expect(spentToday(txs, now)).toBe(500);
  const d = dailyLimit(txs, settings, now);
  expect(leftToday(txs, settings, now)).toBe(d.limit - 500);
});

test('monthSeries: cumulative and ideal pace', () => {
  const s = monthSeries([tx(1, 1000), tx(3, 500), tx(8, 200)], settings, now);
  expect(s.cumulative).toHaveLength(8);
  expect(s.cumulative[0].value).toBe(1000);
  expect(s.cumulative[2].value).toBe(1500);
  expect(s.total).toBe(1700);
  expect(s.ideal[29].value).toBeCloseTo(30000);
  expect(s.idealToday).toBeCloseTo(8000);
  expect(s.diff).toBeCloseTo(6300);
});

test('categorySpent', () => {
  const r = categorySpent([tx(2, 8000, 'cafe'), tx(3, 100, 'kids')], seedCategories.map((c) => ({ ...c, monthlyLimit: 7000 })), now);
  const cafe = r.find((x) => x.category.id === 'cafe')!;
  expect(cafe.spent).toBe(8000);
  expect(cafe.over).toBe(true);
  expect(r.find((x) => x.category.id === 'kids')!.spent).toBe(100);
});

test('streak counts consecutive days within limit', () => {
  // limit ~ 1000/day; days 1..8 spend 100 each -> 8 day streak
  const ok = [1, 2, 3, 4, 5, 6, 7, 8].map((d) => tx(d, 100));
  expect(streak(ok, settings, now)).toBe(8);
  // blow up day 5 -> streak is days 6..8 = 3
  const broken = [...ok, tx(5, 20000)];
  expect(streak(broken, settings, now)).toBe(3);
  // today over limit -> 0
  expect(streak([...ok, tx(8, 50000)], settings, now)).toBe(0);
  expect(streak([], settings, now)).toBe(0);
});

test('parseQuickInput', () => {
  expect(parseQuickInput('кофе 250, такси 480')).toEqual([
    { note: 'кофе', amount: 250, categoryId: 'cafe' },
    { note: 'такси', amount: 480, categoryId: 'transport' },
  ]);
  const r = parseQuickInput('Пятёрочка 1 240 ₽; 900 детский центр\nаптека 350р, абракадабра, бла 0');
  expect(r.map((x) => [x.amount, x.categoryId])).toEqual([
    [1240, 'groceries'], [900, 'kids'], [350, 'health'],
  ]);
  expect(parseQuickInput('что-то 100')[0].categoryId).toBe('other');
  expect(parseQuickInput('')).toEqual([]);
});

const acc = (id: string, initialBalance: number, archived = false) => ({
  id, name: id, type: 'card' as const, initialBalance, color: '#000', icon: '💳', archived,
});
const op = (kind: 'expense' | 'income' | 'transfer', amount: number, accountId: string, toAccountId?: string, day = 8): Transaction => ({
  id: `o${n++}`, kind, amount, categoryId: kind === 'transfer' ? '' : 'other', note: '', date: new Date(2026, 10, day, 9).toISOString(), accountId, toAccountId,
});

test('account balance: initial + income - expense, transfers in/out', () => {
  const a = acc('a1', 1000), b = acc('b1', 0);
  const txs = [op('income', 500, 'a1'), op('expense', 200, 'a1'), op('transfer', 300, 'a1', 'b1'), op('expense', 50, 'b1')];
  expect(accountBalance(a, txs)).toBe(1000);
  expect(accountBalance(b, txs)).toBe(250);
  expect(totalBalance([a, b], txs)).toBe(1250); // transfers are neutral
  expect(totalBalance([a, acc('c', 999, true)], txs)).toBe(1000); // archived excluded
});

test('budget counts only expenses', () => {
  const txs = [op('income', 90000, 'a1'), op('transfer', 5000, 'a1', 'b1'), op('expense', 100, 'a1')];
  expect(spentToday(txs, now)).toBe(100);
  expect(monthSeries(txs, settings, now).total).toBe(100);
  expect(streak(txs, settings, now)).toBeGreaterThanOrEqual(1);
});

test('monthBudget: explicit budget wins, else income - fixed', () => {
  expect(monthBudget({ ...settings, monthlyBudget: 12345 })).toBe(12345);
  expect(monthBudget(settings)).toBe(30000);
  expect(monthBudget({ ...settings, monthlyIncome: 0, fixedExpenses: 0 })).toBe(0);
});

test('empty state: no NaN, no crash', () => {
  const empty = { ...settings, monthlyIncome: 0, fixedExpenses: 0 };
  const d = dailyLimit([], empty, now);
  expect(d.limit).toBe(0);
  expect(Number.isNaN(d.leftToday)).toBe(false);
  const s = monthSeries([], empty, now);
  expect(s.total).toBe(0);
  expect(Number.isNaN(s.diff)).toBe(false);
  expect(streak([], empty, now)).toBe(0);
  expect(categorySpent([], seedCategories, now).every((c) => c.spent === 0 && c.ratio === 0)).toBe(true);
  expect(totalBalance([], [])).toBe(0);
});

test('store data: migrate wipes old demo state; export/import roundtrip', () => {
  const old = { transactions: [{ id: 'seed-1', amount: 5, categoryId: 'cafe', note: '', date: new Date().toISOString() }] };
  const m = migrateState(old, 0);
  expect(m.transactions).toHaveLength(0);
  expect(m.accounts).toHaveLength(0);
  const d = emptyData();
  d.accounts = [acc('a1', 10)];
  d.transactions = [op('income', 5, 'a1')];
  const back = parseImport(exportJson(d))!;
  expect(back.accounts).toHaveLength(1);
  expect(back.transactions).toHaveLength(1);
  expect(parseImport('not json')).toBeNull();
  expect(parseImport('{"accounts":1}')).toBeNull();
});

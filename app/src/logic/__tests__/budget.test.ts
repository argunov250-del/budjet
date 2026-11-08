import {
  categorySpent, dailyLimit, monthSeries, parseQuickInput, spentToday, leftToday, streak, daysLeft, daysInMonth,
} from '../budget';
import type { Transaction } from '../../store/types';
import { seedCategories } from '../../store/seed';

const settings = { monthlyIncome: 70000, payday: 5, fixedExpenses: 40000 }; // budget 30000, Nov = 30 days => 1000/day
const now = new Date(2026, 10, 8, 12, 0); // 8 Nov, 23 days left incl. today
let n = 0;
const tx = (day: number, amount: number, categoryId = 'cafe', month = 10): Transaction => ({
  id: `t${n++}`, amount, categoryId, note: 'x', date: new Date(2026, month, day, 10, 0).toISOString(),
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
  const r = categorySpent([tx(2, 8000, 'cafe'), tx(3, 100, 'kids')], seedCategories, now);
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

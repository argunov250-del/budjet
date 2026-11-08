export type IconName =
  | 'cart' | 'kid' | 'coffee' | 'car' | 'home' | 'heart' | 'ticket' | 'repeat' | 'tag'
  | 'house' | 'list' | 'sparkles' | 'target' | 'bars' | 'calendar' | 'sun' | 'check' | 'plus';

export type Category = {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  monthlyLimit: number;
};

export type Transaction = {
  id: string;
  /** positive number of rubles spent */
  amount: number;
  categoryId: string;
  note: string;
  /** ISO 8601 */
  date: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  emoji?: string;
};

export type Settings = {
  monthlyIncome: number;
  /** day of month income arrives (1-31) */
  payday: number;
  /** monthly fixed expenses (rent, loans...) excluded from the daily budget */
  fixedExpenses: number;
};

export type NewTransaction = {
  amount: number;
  categoryId: string;
  note: string;
  date?: string;
};

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

export type TxKind = 'expense' | 'income' | 'transfer';
export type AccountType = 'card' | 'cash' | 'savings' | 'other';

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  color: string;
  /** emoji */
  icon: string;
  archived: boolean;
};

export type Transaction = {
  id: string;
  kind: TxKind;
  /** positive number of rubles */
  amount: number;
  /** expense/income category id; '' for transfers */
  categoryId: string;
  note: string;
  /** ISO 8601 */
  date: string;
  accountId: string;
  /** transfer destination */
  toAccountId?: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  emoji?: string;
};

export type ThemePref = 'system' | 'light' | 'dark';

export type Settings = {
  /** monthly income (0 = unknown) */
  monthlyIncome: number;
  /** day of month income arrives (1-31) */
  payday: number;
  /** monthly fixed expenses (rent, loans...) excluded from the daily budget */
  fixedExpenses: number;
  /** explicit monthly spending budget; 0 = use income - fixed */
  monthlyBudget: number;
  theme: ThemePref;
};

export type NewTransaction = {
  kind?: TxKind;
  amount: number;
  categoryId?: string;
  note: string;
  date?: string;
  /** defaults to the last used (or first active) account */
  accountId?: string;
  toAccountId?: string;
};

export type NewAccount = {
  name: string;
  type?: AccountType;
  initialBalance?: number;
  color?: string;
  icon?: string;
};

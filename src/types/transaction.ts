/**
 * Transaction type values
 */
export type TransactionType = "sale" | "purchase";

/**
 * Core transaction type for Steam Market data
 */
export interface Transaction {
  id: string;
  item: string;
  game: string;
  date: string;
  price_cents: number;
  type: TransactionType | string;
  created_at: string;
  updated_at: string;
}

/**
 * Transaction without system-generated fields (for creating new transactions)
 */
export type NewTransaction = Omit<Transaction, "id" | "created_at" | "updated_at">;

/**
 * Summary totals for selected transactions
 */
export interface TransactionTotals {
  gains: number;
  spent: number;
  net: number;
}

import { STORAGE_KEYS } from "./constants";
import { Transaction } from "@/types/transaction";

/**
 * Local storage utilities for transaction data persistence
 */

/**
 * Load transactions from localStorage
 */
export const loadTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load transactions from storage:", error);
    return [];
  }
};

/**
 * Save transactions to localStorage
 */
export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to save transactions to storage:", error);
  }
};

/**
 * Clear all transactions from localStorage
 */
export const clearTransactions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  } catch (error) {
    console.error("Failed to clear transactions from storage:", error);
  }
};

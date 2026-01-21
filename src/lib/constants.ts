/**
 * Application-wide constants
 * Centralized location for magic strings and configuration values
 */

// Storage keys
export const STORAGE_KEYS = {
  TRANSACTIONS: "steam-market-transactions",
} as const;

// CSV header normalization map
export const CSV_HEADER_MAP: Record<string, string> = {
  "item name": "item",
  "game name": "game",
  "acted on": "date",
  "price in cents": "price_cents",
  "type": "type",
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  SALE: "sale",
  PURCHASE: "purchase",
} as const;

// Filter defaults
export const FILTER_DEFAULTS = {
  ALL: "all",
} as const;

// Date inference settings
export const DATE_SETTINGS = {
  MIN_YEAR: 2000,
  MAX_FUTURE_YEAR: 2050,
} as const;

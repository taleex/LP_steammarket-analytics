import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Transaction, NewTransaction } from "@/types/transaction";

const STORAGE_KEY = "steam-market-transactions";

/**
 * Load transactions from localStorage
 */
const loadFromStorage = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Save transactions to localStorage
 */
const saveToStorage = (transactions: Transaction[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

/**
 * Hook for managing transaction data with localStorage persistence
 */
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const stored = loadFromStorage();
    setTransactions(stored);
    setLoading(false);
  }, []);

  const insertTransactions = (newTransactions: NewTransaction[]) => {
    const now = new Date().toISOString();
    const withIds = newTransactions.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    }));

    const updated = [...transactions, ...withIds].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setTransactions(updated);
    saveToStorage(updated);

    toast({
      title: "Transactions imported",
      description: `Imported ${withIds.length} transactions.`,
    });

    return { data: withIds, error: null };
  };

  const deleteAllTransactions = () => {
    setTransactions([]);
    saveToStorage([]);

    toast({
      title: "Success",
      description: "All transactions have been deleted.",
    });

    return { error: null };
  };

  return {
    transactions,
    loading,
    insertTransactions,
    deleteAllTransactions,
  };
};

// Re-export types for convenience
export type { Transaction, NewTransaction } from "@/types/transaction";

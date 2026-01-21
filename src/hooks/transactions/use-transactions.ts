import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { loadTransactions, saveTransactions } from "@/lib/storage";
import { Transaction, NewTransaction } from "@/types/transaction";

/**
 * Hook for managing transaction data with localStorage persistence
 */
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load transactions on mount
  useEffect(() => {
    const stored = loadTransactions();
    setTransactions(stored);
    setLoading(false);
  }, []);

  /**
   * Insert new transactions and persist to storage
   */
  const insertTransactions = useCallback(
    (newTransactions: NewTransaction[]) => {
      const now = new Date().toISOString();

      const withIds: Transaction[] = newTransactions.map((t) => ({
        ...t,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now,
      }));

      const updated = [...transactions, ...withIds].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(updated);
      saveTransactions(updated);

      toast({
        title: "Transactions imported",
        description: `Imported ${withIds.length} transactions.`,
      });

      return { data: withIds, error: null };
    },
    [transactions, toast]
  );

  /**
   * Delete all transactions and clear storage
   */
  const deleteAllTransactions = useCallback(() => {
    setTransactions([]);
    saveTransactions([]);

    toast({
      title: "Success",
      description: "All transactions have been deleted.",
    });

    return { error: null };
  }, [toast]);

  return {
    transactions,
    loading,
    insertTransactions,
    deleteAllTransactions,
  };
};

// Re-export types for convenience
export type { Transaction, NewTransaction } from "@/types/transaction";

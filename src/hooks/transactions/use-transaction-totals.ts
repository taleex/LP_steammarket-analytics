import { useMemo } from "react";
import { Transaction, TransactionTotals } from "@/types/transaction";

/**
 * Hook for calculating transaction totals based on selected items
 * Uses Map for O(1) lookups instead of O(n) find() calls
 */
export const useTransactionTotals = (
  selectedItems: Set<string>,
  transactions: Transaction[]
): TransactionTotals => {
  // Create a Map for O(1) lookups
  const transactionMap = useMemo(
    () => new Map(transactions.map((t) => [t.id, t])),
    [transactions]
  );

  return useMemo(() => {
    let totalGains = 0;
    let totalSpent = 0;

    selectedItems.forEach((id) => {
      const transaction = transactionMap.get(id);
      if (transaction) {
        if (transaction.type === "sale") {
          totalGains += transaction.price_cents;
        } else {
          totalSpent += transaction.price_cents;
        }
      }
    });

    return {
      gains: totalGains,
      spent: totalSpent,
      net: totalGains - totalSpent,
    };
  }, [selectedItems, transactionMap]);
};

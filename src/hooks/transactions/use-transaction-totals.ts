import { useMemo } from "react";
import { Transaction, TransactionTotals } from "@/types/transaction";

/**
 * Hook for calculating transaction totals based on selected items
 */
export const useTransactionTotals = (
  selectedItems: Set<string>,
  transactions: Transaction[]
): TransactionTotals => {
  return useMemo(() => {
    let totalGains = 0;
    let totalSpent = 0;

    selectedItems.forEach((id) => {
      const transaction = transactions.find((t) => t.id === id);
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
  }, [selectedItems, transactions]);
};

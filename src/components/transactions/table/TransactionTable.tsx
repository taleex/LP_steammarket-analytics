import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Transaction, TransactionTotals } from "@/types/transaction";
import { useTableSelection } from "@/hooks/transactions/use-table-selection";
import { SummaryCards } from "../SummaryCards";
import { EmptyState } from "../EmptyState";
import { TransactionRow } from "./TransactionRow";
import { TransactionTableHeader, TableColumnsHeader } from "./TransactionTableHeader";

interface TransactionTableProps {
  transactions: Transaction[];
}

/**
 * Calculates totals for selected transactions
 */
const calculateTotals = (
  selectedItems: Set<string>,
  transactions: Transaction[]
): TransactionTotals => {
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
};

export const TransactionTable = ({ transactions = [] }: TransactionTableProps) => {
  const {
    selectedItems,
    lastClickedIndex,
    isShiftHeld,
    isAllSelected,
    isPartiallySelected,
    handleSelectItem,
    handleSelectAll,
    handleClearSelection,
    handleRowClick,
  } = useTableSelection(transactions);

  const totals = useMemo(
    () => calculateTotals(selectedItems, transactions),
    [selectedItems, transactions]
  );

  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <SummaryCards
        totals={totals}
        selectedCount={selectedItems.size}
        totalCount={transactions.length}
      />

      <Card className="bg-gradient-card border border-border/50 overflow-hidden backdrop-blur-sm">
        <TransactionTableHeader
          isAllSelected={isAllSelected}
          isPartiallySelected={isPartiallySelected}
          isShiftHeld={isShiftHeld}
          selectedCount={selectedItems.size}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
        />

        <div className="overflow-x-auto">
          <table className="w-full">
            <TableColumnsHeader
              isAllSelected={isAllSelected}
              isPartiallySelected={isPartiallySelected}
              onSelectAll={handleSelectAll}
            />
            <tbody>
              {transactions.map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  index={index}
                  isSelected={selectedItems.has(transaction.id)}
                  isShiftHeld={isShiftHeld}
                  hasLastClickedIndex={lastClickedIndex !== null}
                  onSelect={handleSelectItem}
                  onRowClick={handleRowClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

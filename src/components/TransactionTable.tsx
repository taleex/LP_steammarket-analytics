import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, CheckSquare, Square } from "lucide-react";
import { Transaction, TransactionTotals } from "@/types/transaction";
import { useTableSelection } from "@/hooks/use-table-selection";
import { SummaryCards } from "./transactions/SummaryCards";
import { TransactionRow } from "./transactions/TransactionRow";
import { EmptyState } from "./transactions/EmptyState";

interface TransactionTableProps {
  transactions: Transaction[];
}

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

  // Calculate totals for selected items
  const totals = useMemo((): TransactionTotals => {
    let totalGains = 0;
    let totalSpent = 0;

    selectedItems.forEach(id => {
      const transaction = transactions.find(t => t.id === id);
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
      net: totalGains - totalSpent
    };
  }, [selectedItems, transactions]);

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
        {/* Table Header */}
        <div className="p-6 border-b border-border/50 bg-muted/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Transaction History
              </h3>
              <p className="text-sm text-muted-foreground">
                {isShiftHeld ? (
                  <span className="text-steam-blue">Hold Shift + Click to select range</span>
                ) : (
                  "Click to select • Shift+Click for range"
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {isAllSelected ? (
                  <>
                    <Square className="h-3 w-3 mr-1" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Select All
                  </>
                )}
              </Button>
              {selectedItems.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear ({selectedItems.size})
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/10">
                <th className="text-left p-4 font-semibold text-foreground w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        const input = el.querySelector('button');
                        if (input) {
                          (input as any).indeterminate = isPartiallySelected;
                        }
                      }
                    }}
                    className={isPartiallySelected ? "data-[state=checked]:bg-primary/50" : ""}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-semibold text-foreground">Item</th>
                <th className="text-left p-4 font-semibold text-foreground">Game</th>
                <th className="text-left p-4 font-semibold text-foreground">Date</th>
                <th className="text-left p-4 font-semibold text-foreground">Type</th>
                <th className="text-left p-4 font-semibold text-foreground">Price</th>
              </tr>
            </thead>
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

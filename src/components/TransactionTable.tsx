import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calculator, Database } from "lucide-react";
import { parseTransactionDate, formatForPT } from "@/lib/date";

interface Transaction {
  id: number;
  item: string;
  game: string;
  date: string;
  price_cents: number;
  type: "purchase" | "sale";
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable = ({ transactions = [] }: TransactionTableProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const parsed = parseTransactionDate(dateString);
    if (!parsed.date) {
      console.warn('Invalid date format:', dateString);
      return dateString;
    }
    return formatForPT(parsed.date, parsed.hasTime);
  };

  const totals = useMemo(() => {
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

  const handleSelectItem = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(transactions.map(t => t.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleRowClick = (index: number, id: number, e: any) => {
    const isSelected = selectedItems.has(id);
    const shouldSelect = !isSelected;

    if (e.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const newSelected = new Set(selectedItems);

      for (let i = start; i <= end; i++) {
        const rangeId = transactions[i]?.id;
        if (rangeId !== undefined) {
          if (shouldSelect) newSelected.add(rangeId);
          else newSelected.delete(rangeId);
        }
      }

      setSelectedItems(newSelected);
    } else {
      handleSelectItem(id, shouldSelect);
    }

    setLastClickedIndex(index);

    // Clear any text selection caused by shift-click
    if (e.shiftKey) {
      try {
        window.getSelection()?.removeAllRanges();
      } catch {}
    }
  };
  if (transactions.length === 0) {
    return (
      <div className="space-y-8 animate-slide-up">
        {/* Empty state */}
        <Card className="p-12 bg-gradient-card border border-border/50 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-muted/5 pointer-events-none" />
          <div className="relative space-y-4">
            <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto">
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                No data loaded
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Import a CSV file to start analyzing your Steam Market transactions
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-card border border-border/50 relative overflow-hidden hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-profit/10 to-profit/5 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="p-3 bg-profit/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-profit" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium">Total Profit</div>
              <div className="text-2xl font-bold text-profit">
                {formatPrice(totals.gains)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border border-border/50 relative overflow-hidden hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-loss/10 to-loss/5 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="p-3 bg-loss/20 rounded-lg">
              <TrendingDown className="h-6 w-6 text-loss" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium">Total Spent</div>
              <div className="text-2xl font-bold text-loss">
                {formatPrice(totals.spent)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border border-border/50 relative overflow-hidden hover:scale-105 transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${totals.net >= 0 ? 'from-profit/10 to-profit/5' : 'from-loss/10 to-loss/5'} pointer-events-none`} />
          <div className="relative flex items-center gap-4">
            <div className={`p-3 rounded-lg ${totals.net >= 0 ? 'bg-profit/20' : 'bg-loss/20'}`}>
              <Calculator className={`h-6 w-6 ${totals.net >= 0 ? 'text-profit' : 'text-loss'}`} />
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium">Net Balance</div>
              <div className={`text-2xl font-bold ${totals.net >= 0 ? 'text-profit' : 'text-loss'}`}>
                {formatPrice(totals.net)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border border-border/50 relative overflow-hidden hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-steam-blue/10 to-steam-blue/5 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="p-3 bg-steam-blue/20 rounded-lg">
              <Database className="h-6 w-6 text-steam-blue" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium">Selected Items</div>
              <div className="text-2xl font-bold text-foreground">
                {selectedItems.size} / {transactions.length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className="bg-gradient-card border border-border/50 overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-border/50 bg-muted/5">
          <h3 className="text-lg font-semibold text-foreground">
            Transaction History
          </h3>
          <p className="text-sm text-muted-foreground">
            Select transactions for detailed analysis
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/10">
                <th className="text-left p-4 font-semibold text-foreground">
                  <Checkbox
                    checked={selectedItems.size === transactions.length && transactions.length > 0}
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
                <tr 
                  key={transaction.id} 
                  className={`border-b border-border/30 hover:bg-muted/20 transition-colors duration-200 animate-fade-in cursor-pointer ${
                    selectedItems.has(transaction.id) ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onMouseDown={(e) => { if (e.shiftKey && e.button === 0) e.preventDefault(); }}
                  onClick={(e) => handleRowClick(index, transaction.id, e)}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedItems.has(transaction.id)}
                      onCheckedChange={(checked) => 
                        handleSelectItem(transaction.id, checked as boolean)
                      }
                    />
                  </td>
                  <td className="p-4 text-foreground font-medium max-w-xs">
                    <div className="truncate" title={transaction.item}>
                      {transaction.item}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground font-mono text-sm">
                    {transaction.game}
                  </td>
                  <td className="p-4 text-muted-foreground font-mono text-sm">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={transaction.type === "sale" ? "default" : "secondary"}
                      className={transaction.type === "sale" ? 
                        "bg-profit/20 text-profit border-profit/30 hover:bg-profit/30" : 
                        "bg-loss/20 text-loss border-loss/30 hover:bg-loss/30"
                      }
                    >
                      {transaction.type === "sale" ? "Sale" : "Purchase"}
                    </Badge>
                  </td>
                  <td className={`p-4 font-bold font-mono ${
                    transaction.type === "sale" ? "text-profit" : "text-loss"
                  }`}>
                    {formatPrice(transaction.price_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
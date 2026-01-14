import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calculator, Database } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { TransactionTotals } from "@/types/transaction";

interface SummaryCardsProps {
  totals: TransactionTotals;
  selectedCount: number;
  totalCount: number;
}

export const SummaryCards = ({ totals, selectedCount, totalCount }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Profit Card */}
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

      {/* Spent Card */}
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

      {/* Net Balance Card */}
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

      {/* Selected Items Card */}
      <Card className="p-6 bg-gradient-card border border-border/50 relative overflow-hidden hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-steam-blue/10 to-steam-blue/5 pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-steam-blue/20 rounded-lg">
            <Database className="h-6 w-6 text-steam-blue" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground font-medium">Selected Items</div>
            <div className="text-2xl font-bold text-foreground">
              {selectedCount} / {totalCount}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

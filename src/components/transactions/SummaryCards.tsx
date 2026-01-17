import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calculator, Database } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { TransactionTotals } from "@/types/transaction";

interface SummaryCardsProps {
  totals: TransactionTotals;
  selectedCount: number;
  totalCount: number;
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
  gradientClass: string;
}

const SummaryCard = ({ icon, label, value, colorClass, gradientClass }: SummaryCardProps) => (
  <Card className="p-6 bg-gradient-card border border-border/50 relative overflow-hidden hover:scale-105 transition-all duration-300">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} pointer-events-none`} />
    <div className="relative flex items-center gap-4">
      {icon}
      <div>
        <div className="text-sm text-muted-foreground font-medium">{label}</div>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      </div>
    </div>
  </Card>
);

export const SummaryCards = ({ totals, selectedCount, totalCount }: SummaryCardsProps) => {
  const isNetPositive = totals.net >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <SummaryCard
        icon={
          <div className="p-3 bg-profit/20 rounded-lg">
            <TrendingUp className="h-6 w-6 text-profit" />
          </div>
        }
        label="Total Profit"
        value={formatPrice(totals.gains)}
        colorClass="text-profit"
        gradientClass="from-profit/10 to-profit/5"
      />

      <SummaryCard
        icon={
          <div className="p-3 bg-loss/20 rounded-lg">
            <TrendingDown className="h-6 w-6 text-loss" />
          </div>
        }
        label="Total Spent"
        value={formatPrice(totals.spent)}
        colorClass="text-loss"
        gradientClass="from-loss/10 to-loss/5"
      />

      <SummaryCard
        icon={
          <div className={`p-3 rounded-lg ${isNetPositive ? "bg-profit/20" : "bg-loss/20"}`}>
            <Calculator className={`h-6 w-6 ${isNetPositive ? "text-profit" : "text-loss"}`} />
          </div>
        }
        label="Net Balance"
        value={formatPrice(totals.net)}
        colorClass={isNetPositive ? "text-profit" : "text-loss"}
        gradientClass={isNetPositive ? "from-profit/10 to-profit/5" : "from-loss/10 to-loss/5"}
      />

      <SummaryCard
        icon={
          <div className="p-3 bg-steam-blue/20 rounded-lg">
            <Database className="h-6 w-6 text-steam-blue" />
          </div>
        }
        label="Selected Items"
        value={`${selectedCount} / ${totalCount}`}
        colorClass="text-foreground"
        gradientClass="from-steam-blue/10 to-steam-blue/5"
      />
    </div>
  );
};

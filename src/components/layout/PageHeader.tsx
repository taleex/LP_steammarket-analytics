import { BarChart3, TrendingUp } from "lucide-react";

interface PageHeaderProps {
  transactionCount: number;
}

export const PageHeader = ({ transactionCount }: PageHeaderProps) => {
  return (
    <header className="mb-12 text-center space-y-6 animate-fade-in">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="p-3 bg-gradient-primary rounded-xl shadow-lg animate-glow">
          <BarChart3 className="h-8 w-8 text-primary-foreground" />
        </div>
        <div className="p-3 bg-gradient-steam rounded-xl shadow-lg">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
          Steam Market
          <span className="bg-gradient-primary bg-clip-text text-transparent block md:inline">
            {" "}Analytics
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Advanced and intuitive analysis of your Steam Market transaction history.
          Discover patterns, calculate profits and optimize your trading strategies.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-profit rounded-full" />
          Profit Analysis ({transactionCount} transactions)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-steam-blue rounded-full" />
          CSV Import
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full" />
          Detailed Reports
        </div>
      </div>
    </header>
  );
};

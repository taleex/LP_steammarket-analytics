import { useState } from "react";
import { TransactionTable } from "@/components/TransactionTable";
import { CSVUpload } from "@/components/CSVUpload";
import { BarChart3, TrendingUp } from "lucide-react";

interface Transaction {
  id: number;
  item: string;
  game: string;
  date: string;
  price_cents: number;
  type: "purchase" | "sale";
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleDataLoaded = (data: Transaction[]) => {
    setTransactions(data);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Header */}
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
              <div className="w-2 h-2 bg-profit rounded-full"></div>
              Profit Analysis
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-steam-blue rounded-full"></div>
              CSV Import
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Detailed Reports
            </div>
          </div>
        </header>
        
        <div className="space-y-12">
          <CSVUpload 
            onDataLoaded={handleDataLoaded} 
            hasData={transactions.length > 0}
          />
          
          <TransactionTable transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default Index;
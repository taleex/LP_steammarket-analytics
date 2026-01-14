import { useState, useEffect } from "react";
import { TransactionTable } from "@/components/TransactionTable";
import { CSVUpload } from "@/components/CSVUpload";
import { TransactionFilters } from "@/components/TransactionFilters";
import { useTransactions, Transaction } from "@/hooks/use-transactions";
import { BarChart3, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { transactions, loading } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  const handleFilteredTransactions = (filtered: Transaction[]) => {
    setFilteredTransactions(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

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
              Profit Analysis ({transactions.length} transactions)
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
            hasData={transactions.length > 0}
          />
          
          {transactions.length > 0 && (
            <TransactionFilters 
              transactions={transactions}
              onFilteredTransactions={handleFilteredTransactions}
            />
          )}
          
          <TransactionTable transactions={filteredTransactions} />
        </div>
      </div>
    </div>
  );
};

export default Index;

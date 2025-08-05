import { useState } from "react";
import { TransactionTable } from "@/components/TransactionTable";
import { CSVUpload } from "@/components/CSVUpload";
import { TransactionFilters } from "@/components/TransactionFilters";
import { Navbar } from "@/components/Navbar";
import { BarChart3, TrendingUp } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Transaction } from "@/types/transaction";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleDataLoaded = (data: Transaction[]) => {
    setTransactions(data);
    setFilteredTransactions(data);
  };

  const handleFilteredTransactions = (filtered: Transaction[]) => {
    setFilteredTransactions(filtered);
  };

  const handleAuthChange = (newUser: User | null) => {
    setUser(newUser);
  };

  const handleShowAuthModal = () => {
    // This will trigger the auth modal in the navbar
    const loginButton = document.querySelector('[data-auth-trigger]') as HTMLButtonElement;
    loginButton?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onAuthChange={handleAuthChange} />
      
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
            user={user}
            onShowAuthModal={handleShowAuthModal}
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
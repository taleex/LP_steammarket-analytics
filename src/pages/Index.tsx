import { useState } from "react";
import { TransactionTable } from "@/components/TransactionTable";
import { CSVUpload } from "@/components/CSVUpload";

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Steam Market Analytics
          </h1>
          <p className="text-muted-foreground text-lg">
            Análise de histórico de transações da Steam Market
          </p>
        </header>
        
        <div className="space-y-8">
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
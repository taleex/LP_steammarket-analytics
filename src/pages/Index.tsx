import { useState, useEffect, useCallback } from "react";
import { PageHeader, LoadingSkeleton } from "@/components/layout";
import { CSVUpload } from "@/components/csv-import";
import { TransactionTable, TransactionFilters } from "@/components/transactions";
import { useTransactions, Transaction } from "@/hooks";

const Index = () => {
  const { transactions, loading, insertTransactions, deleteAllTransactions } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  const handleFilteredTransactions = useCallback((filtered: Transaction[]) => {
    setFilteredTransactions(filtered);
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        <PageHeader transactionCount={transactions.length} />

        <div className="space-y-12">
          <CSVUpload
            hasData={transactions.length > 0}
            insertTransactions={insertTransactions}
            deleteAllTransactions={deleteAllTransactions}
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

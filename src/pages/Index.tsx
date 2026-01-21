import { useState, useEffect, useCallback } from "react";
import { PageHeader, Footer, LoadingSkeleton } from "@/components/layout";
import { CSVUpload } from "@/components/csv-import";
import { TransactionTable, TransactionFilters } from "@/components/transactions";
import { useTransactions } from "@/hooks/transactions";
import { Transaction } from "@/types/transaction";

/**
 * Main application page
 * Displays the Steam Market transaction analyzer interface
 */
const Index = () => {
  const { transactions, loading, insertTransactions, deleteAllTransactions } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // Sync filtered transactions with source data
  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  // Memoized filter handler
  const handleFilteredTransactions = useCallback((filtered: Transaction[]) => {
    setFilteredTransactions(filtered);
  }, []);

  // Show loading state while transactions are being loaded
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        <PageHeader transactionCount={transactions.length} />

        <div className="space-y-12">
          {/* CSV Import Section */}
          <CSVUpload
            hasData={transactions.length > 0}
            insertTransactions={insertTransactions}
            deleteAllTransactions={deleteAllTransactions}
          />

          {/* Filters Section - Only show when data exists */}
          {transactions.length > 0 && (
            <TransactionFilters
              transactions={transactions}
              onFilteredTransactions={handleFilteredTransactions}
            />
          )}

          {/* Transaction Table */}
          <TransactionTable transactions={filteredTransactions} />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Index;

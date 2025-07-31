import { TransactionTable } from "@/components/TransactionTable";

const Index = () => {
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
        
        <TransactionTable />
      </div>
    </div>
  );
};

export default Index;
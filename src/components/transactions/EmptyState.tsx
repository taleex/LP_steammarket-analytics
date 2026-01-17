import { Card } from "@/components/ui/card";
import { Database } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="p-12 bg-gradient-card border border-border/50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-muted/5 pointer-events-none" />
        <div className="relative space-y-4">
          <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto">
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">No data loaded</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Import a CSV file to start analyzing your Steam Market transactions
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

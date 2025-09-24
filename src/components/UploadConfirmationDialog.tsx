import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, FileText, Upload, Copy } from 'lucide-react';
import { Transaction } from '@/hooks/use-transactions';

interface UploadConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTransactions: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
  onConfirm: () => void;
  isLoading: boolean;
}

const UploadConfirmationDialog = ({
  open,
  onOpenChange,
  newTransactions,
  onConfirm,
  isLoading
}: UploadConfirmationDialogProps) => {

  const formatPrice = (priceCents: number) => {
    return `€${(priceCents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[75vh] w-[95vw] bg-card flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5" />
            Confirm CSV Import
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review the transactions that will be imported to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 flex-1 overflow-hidden">
          {/* Summary Stats */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 md:p-4 bg-gradient-card rounded-lg border">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-profit flex-shrink-0" />
            <div>
              <p className="text-xl sm:text-2xl font-bold text-card-foreground">{newTransactions.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Transactions to import</p>
            </div>
          </div>

          {/* Transaction Previews */}
          <div className="space-y-4 flex-1 overflow-y-auto">
            {newTransactions.length > 0 && (
              <div>
                <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2 sticky top-0 bg-card z-10 pb-2">
                  <CheckCircle className="h-4 w-4 text-profit" />
                  Transactions to Import ({newTransactions.length})
                </h4>
                <ScrollArea className="h-40 md:h-48 border rounded-lg bg-gradient-subtle">
                  <div className="p-2 md:p-4 space-y-2 md:space-y-3">
                    {newTransactions.map((transaction, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-2 md:p-3 rounded-md bg-card border border-border/50 hover:border-border transition-colors">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-profit flex-shrink-0" />
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-medium text-card-foreground text-sm md:text-base truncate">{transaction.item}</span>
                            <Badge variant="outline" className="text-xs w-fit">
                              {transaction.game}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                          <Badge 
                            variant="outline"
                            className={`text-xs ${transaction.type === 'sale' 
                              ? 'bg-profit/10 text-profit border-profit/30 hover:bg-profit/20' 
                              : 'bg-loss/10 text-loss border-loss/30 hover:bg-loss/20'}`}
                          >
                            {transaction.type}
                          </Badge>
                          <span className={`font-mono font-semibold text-sm md:text-base ${transaction.type === 'sale' ? 'text-profit' : 'text-loss'}`}>
                            {formatPrice(transaction.price_cents)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0 mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm()} 
            disabled={isLoading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? "Importing..." : `Import ${newTransactions.length} Transactions`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadConfirmationDialog;

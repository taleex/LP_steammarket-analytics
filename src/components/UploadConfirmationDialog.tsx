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
  duplicateTransactions: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
  onConfirm: (skipDuplicates: boolean) => void;
  isLoading: boolean;
}

const UploadConfirmationDialog = ({
  open,
  onOpenChange,
  newTransactions,
  duplicateTransactions,
  onConfirm,
  isLoading
}: UploadConfirmationDialogProps) => {
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const formatPrice = (priceCents: number) => {
    return `€${(priceCents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] w-[95vw] bg-card flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5" />
            Confirm CSV Import
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review the transactions that will be imported to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gradient-card rounded-lg border">
              <CheckCircle className="h-6 w-6 text-profit flex-shrink-0" />
              <div>
                <p className="text-xl font-bold text-card-foreground">{newTransactions.length}</p>
                <p className="text-sm text-muted-foreground">New transactions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gradient-card rounded-lg border">
              <AlertCircle className="h-6 w-6 text-neutral flex-shrink-0" />
              <div>
                <p className="text-xl font-bold text-card-foreground">{duplicateTransactions.length}</p>
                <p className="text-sm text-muted-foreground">Potential duplicates</p>
              </div>
            </div>
          </div>

          {/* Scrollable Transaction Previews */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {newTransactions.length > 0 && (
              <div>
                <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2 sticky top-0 bg-card z-10 py-2">
                  <CheckCircle className="h-4 w-4 text-profit" />
                  New Transactions ({newTransactions.length})
                </h4>
                <div className="space-y-2">
                  {newTransactions.map((transaction, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md bg-gradient-subtle border border-border/50 hover:border-border transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle className="h-4 w-4 text-profit flex-shrink-0" />
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-medium text-card-foreground text-sm truncate">{transaction.item}</span>
                          <Badge variant="outline" className="text-xs w-fit">
                            {transaction.game}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge 
                          variant="outline"
                          className={`text-xs ${transaction.type === 'sale' 
                            ? 'bg-profit/10 text-profit border-profit/30' 
                            : 'bg-loss/10 text-loss border-loss/30'}`}
                        >
                          {transaction.type}
                        </Badge>
                        <span className={`font-mono font-semibold text-sm ${transaction.type === 'sale' ? 'text-profit' : 'text-loss'}`}>
                          {formatPrice(transaction.price_cents)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {duplicateTransactions.length > 0 && (
              <div>
                <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2 sticky top-0 bg-card z-10 py-2">
                  <Copy className="h-4 w-4 text-neutral" />
                  Potential Duplicates ({duplicateTransactions.length})
                </h4>
                <div className="space-y-2">
                  {duplicateTransactions.map((transaction, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md bg-gradient-subtle border border-border/50 hover:border-border transition-colors opacity-75">
                      <div className="flex items-center gap-3 min-w-0">
                        <Copy className="h-4 w-4 text-neutral flex-shrink-0" />
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-medium text-card-foreground text-sm truncate">{transaction.item}</span>
                          <Badge variant="outline" className="text-xs w-fit">
                            {transaction.game}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge 
                          variant="outline"
                          className={`text-xs ${transaction.type === 'sale' 
                            ? 'bg-profit/10 text-profit border-profit/30' 
                            : 'bg-loss/10 text-loss border-loss/30'}`}
                        >
                          {transaction.type}
                        </Badge>
                        <span className={`font-mono font-semibold text-sm ${transaction.type === 'sale' ? 'text-profit' : 'text-loss'}`}>
                          {formatPrice(transaction.price_cents)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {duplicateTransactions.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-card-foreground mb-3">Duplicate Handling</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={skipDuplicates}
                      onChange={() => setSkipDuplicates(true)}
                      className="text-primary"
                    />
                    <span className="text-sm">Skip duplicates (recommended)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!skipDuplicates}
                      onChange={() => setSkipDuplicates(false)}
                      className="text-primary"
                    />
                    <span className="text-sm">Import duplicates anyway</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(skipDuplicates)} 
            disabled={isLoading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? "Importing..." : `Import ${skipDuplicates ? newTransactions.length : newTransactions.length + duplicateTransactions.length} Transactions`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadConfirmationDialog;

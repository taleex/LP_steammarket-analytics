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
      <DialogContent className="max-w-2xl max-h-[80vh] bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Confirm CSV Import
          </DialogTitle>
          <DialogDescription>
            Review the transactions that will be imported to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-card rounded-lg border">
              <CheckCircle className="h-8 w-8 text-profit" />
              <div>
                <p className="text-2xl font-bold text-card-foreground">{newTransactions.length}</p>
                <p className="text-sm text-muted-foreground">New transactions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gradient-card rounded-lg border">
              <AlertCircle className="h-8 w-8 text-neutral" />
              <div>
                <p className="text-2xl font-bold text-card-foreground">{duplicateTransactions.length}</p>
                <p className="text-sm text-muted-foreground">Potential duplicates</p>
              </div>
            </div>
          </div>

          {/* Transaction Previews */}
          <div className="space-y-4">
            {newTransactions.length > 0 && (
              <div>
                <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-profit" />
                  New Transactions (all {newTransactions.length})
                </h4>
                <ScrollArea className="h-48 border rounded-lg bg-gradient-subtle">
                  <div className="p-4 space-y-3">
                    {newTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-md bg-card border border-border/50 hover:border-border transition-colors">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-profit flex-shrink-0" />
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-card-foreground">{transaction.item}</span>
                            <Badge variant="outline" className="text-xs w-fit">
                              {transaction.game}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline"
                            className={transaction.type === 'sale' 
                              ? 'bg-profit/10 text-profit border-profit/30 hover:bg-profit/20' 
                              : 'bg-loss/10 text-loss border-loss/30 hover:bg-loss/20'}
                          >
                            {transaction.type}
                          </Badge>
                          <span className={`font-mono font-semibold ${transaction.type === 'sale' ? 'text-profit' : 'text-loss'}`}>
                            {formatPrice(transaction.price_cents)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {duplicateTransactions.length > 0 && (
              <div>
                <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <Copy className="h-4 w-4 text-neutral" />
                  Potential Duplicates (all {duplicateTransactions.length})
                </h4>
                <ScrollArea className="h-48 border rounded-lg bg-gradient-subtle">
                  <div className="p-4 space-y-3">
                    {duplicateTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-md bg-card border border-border/50 hover:border-border transition-colors opacity-75">
                        <div className="flex items-center gap-3">
                          <Copy className="h-4 w-4 text-neutral flex-shrink-0" />
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-card-foreground">{transaction.item}</span>
                            <Badge variant="outline" className="text-xs w-fit">
                              {transaction.game}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline"
                            className={transaction.type === 'sale' 
                              ? 'bg-profit/10 text-profit border-profit/30 hover:bg-profit/20' 
                              : 'bg-loss/10 text-loss border-loss/30 hover:bg-loss/20'}
                          >
                            {transaction.type}
                          </Badge>
                          <span className={`font-mono font-semibold ${transaction.type === 'sale' ? 'text-profit' : 'text-loss'}`}>
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

          {duplicateTransactions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">Duplicate Handling</h4>
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
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(skipDuplicates)} disabled={isLoading}>
            {isLoading ? "Importing..." : `Import ${skipDuplicates ? newTransactions.length : newTransactions.length + duplicateTransactions.length} Transactions`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadConfirmationDialog;

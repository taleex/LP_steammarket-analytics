import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, FileSpreadsheet, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseTransactionDate } from "@/lib/date";
import { useTransactions, Transaction } from "@/hooks/use-transactions";
import UploadConfirmationDialog from "./UploadConfirmationDialog";

interface CSVUploadProps {
  hasData: boolean;
  insertTransactions: (transactions: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[]) => { data: any; error: any };
  deleteAllTransactions: () => { error: any };
}

export const CSVUpload = ({ hasData, insertTransactions, deleteAllTransactions }: CSVUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[]>([]);
  const [duplicateTransactions, setDuplicateTransactions] = useState<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[]>([]);
  const { toast } = useToast();

  const normalizeHeader = (header: string): string => {
    const headerMap: { [key: string]: string } = {
      "item name": "item",
      "game name": "game", 
      "acted on": "date",
      "price in cents": "price_cents",
      "type": "type"
    };
    
    const normalized = header.toLowerCase().trim();
    return headerMap[normalized] || normalized;
  };

  const validateAndConvertData = (data: any[]): Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[] => {
    if (!data || data.length === 0) {
      throw new Error("CSV file is empty");
    }

    const validatedData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[] = [];

    data.forEach((row, index) => {
      if (!row.item || !row.game || !row.date || !row.type) {
        console.warn(`Row ${index + 1} is missing required fields:`, row);
        return;
      }

      // Parse and validate the date
      const parsedDate = parseTransactionDate(row.date);
      if (!parsedDate.date) {
        console.warn(`Row ${index + 1} has invalid date:`, row.date);
        return;
      }

      // Convert price to cents
      let priceCents: number;
      if (typeof row.price === 'string') {
        const priceStr = row.price.replace(/[€$,\s]/g, '');
        priceCents = Math.round(parseFloat(priceStr) * 100);
      } else if (typeof row.price_cents === 'string') {
        priceCents = parseInt(row.price_cents);
      } else {
        priceCents = Math.round((row.price || row.price_cents || 0));
      }

      if (isNaN(priceCents)) {
        console.warn(`Row ${index + 1} has invalid price:`, row.price || row.price_cents);
        return;
      }

      // Validate transaction type
      const type = row.type?.toLowerCase();
      if (type !== 'purchase' && type !== 'sale') {
        console.warn(`Row ${index + 1} has invalid type:`, row.type);
        return;
      }

      validatedData.push({
        item: String(row.item).trim(),
        game: String(row.game).trim(),
        date: parsedDate.date.toISOString(),
        price_cents: priceCents,
        type: type
      });
    });

    return validatedData;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      Papa.parse(file, {
        header: true,
        transformHeader: normalizeHeader,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            if (results.errors.length > 0) {
              console.warn("CSV parsing warnings:", results.errors);
            }
            
            const validatedTransactions = validateAndConvertData(results.data);
            
            if (validatedTransactions.length === 0) {
              throw new Error("No valid transactions found in the CSV file");
            }

            // Set all transactions to be imported
            setPendingTransactions(validatedTransactions);
            setDuplicateTransactions([]);
            setShowConfirmDialog(true);

          } catch (error: any) {
            toast({
              title: "Error processing CSV",
              description: error.message || "Failed to process the CSV file",
              variant: "destructive",
            });
          } finally {
            setIsUploading(false);
          }
        },
        error: (error) => {
          toast({
            title: "Error reading CSV",
            description: error.message || "Failed to read the CSV file",
            variant: "destructive",
          });
          setIsUploading(false);
        }
      });
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsUploading(false);
    }

    // Reset the input
    event.target.value = '';
  };

  const handleConfirmImport = async () => {
    const result = await insertTransactions(pendingTransactions);
    
    if (!result.error) {
      setShowConfirmDialog(false);
      setPendingTransactions([]);
      setDuplicateTransactions([]);
      // Real-time subscription will handle data updates automatically
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClearData = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    await deleteAllTransactions();
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-card border-border/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-card-foreground">Import CSV Data</CardTitle>
              <CardDescription>
                Upload your Steam Market transaction history for analysis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-steam-blue/20 bg-steam-blue/5">
            <AlertDescription className="text-sm">
              <strong>Expected format:</strong> CSV with columns: "Item Name", "Game Name", "Acted On", "Price in Cents", "Type"
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={triggerFileInput}
              disabled={isUploading}
              className="bg-gradient-primary hover:opacity-90 transition-opacity flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Processing..." : hasData ? "Import More Data" : "Upload CSV File"}
            </Button>
            
            {hasData && (
              <Button 
                variant="outline" 
                onClick={handleClearData}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Data
              </Button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />

          <UploadConfirmationDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            newTransactions={pendingTransactions}
            onConfirm={handleConfirmImport}
            isLoading={isUploading}
          />

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete all your transactions? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
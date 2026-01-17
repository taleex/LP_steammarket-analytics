import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, FileSpreadsheet, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseTransactionDate } from "@/lib/date";
import { NewTransaction } from "@/types/transaction";
import { UploadConfirmationDialog } from "./UploadConfirmationDialog";

interface CSVUploadProps {
  hasData: boolean;
  insertTransactions: (transactions: NewTransaction[]) => { data: unknown; error: unknown };
  deleteAllTransactions: () => { error: unknown };
}

/**
 * CSV header normalization map
 */
const HEADER_MAP: Record<string, string> = {
  "item name": "item",
  "game name": "game",
  "acted on": "date",
  "price in cents": "price_cents",
  "type": "type",
};

const normalizeHeader = (header: string): string => {
  const normalized = header.toLowerCase().trim();
  return HEADER_MAP[normalized] || normalized;
};

/**
 * Validates and converts raw CSV data to NewTransaction[]
 */
const validateAndConvertData = (data: Record<string, unknown>[]): NewTransaction[] => {
  if (!data || data.length === 0) {
    throw new Error("CSV file is empty");
  }

  const validatedData: NewTransaction[] = [];

  data.forEach((row, index) => {
    const item = row.item as string | undefined;
    const game = row.game as string | undefined;
    const date = row.date as string | undefined;
    const type = row.type as string | undefined;

    if (!item || !game || !date || !type) {
      console.warn(`Row ${index + 1} is missing required fields:`, row);
      return;
    }

    const parsedDate = parseTransactionDate(date);
    if (!parsedDate.date) {
      console.warn(`Row ${index + 1} has invalid date:`, date);
      return;
    }

    let priceCents: number;
    const price = row.price as string | number | undefined;
    const priceCentsRaw = row.price_cents as string | number | undefined;

    if (typeof price === "string") {
      const priceStr = price.replace(/[€$,\s]/g, "");
      priceCents = Math.round(parseFloat(priceStr) * 100);
    } else if (typeof priceCentsRaw === "string") {
      priceCents = parseInt(priceCentsRaw);
    } else {
      priceCents = Math.round(Number(price || priceCentsRaw || 0));
    }

    if (isNaN(priceCents)) {
      console.warn(`Row ${index + 1} has invalid price:`, price || priceCentsRaw);
      return;
    }

    const normalizedType = type.toLowerCase();
    if (normalizedType !== "purchase" && normalizedType !== "sale") {
      console.warn(`Row ${index + 1} has invalid type:`, type);
      return;
    }

    validatedData.push({
      item: String(item).trim(),
      game: String(game).trim(),
      date: parsedDate.date.toISOString(),
      price_cents: priceCents,
      type: normalizedType,
    });
  });

  return validatedData;
};

export const CSVUpload = ({
  hasData,
  insertTransactions,
  deleteAllTransactions,
}: CSVUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<NewTransaction[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
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

            const validatedTransactions = validateAndConvertData(
              results.data as Record<string, unknown>[]
            );

            if (validatedTransactions.length === 0) {
              throw new Error("No valid transactions found in the CSV file");
            }

            setPendingTransactions(validatedTransactions);
            setShowConfirmDialog(true);
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to process the CSV file";
            toast({
              title: "Error processing CSV",
              description: message,
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
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error uploading file",
        description: message,
        variant: "destructive",
      });
      setIsUploading(false);
    }

    event.target.value = "";
  };

  const handleConfirmImport = async () => {
    const result = insertTransactions(pendingTransactions);

    if (!result.error) {
      setShowConfirmDialog(false);
      setPendingTransactions([]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClearData = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    deleteAllTransactions();
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
              <strong>Expected format:</strong> CSV with columns: "Item Name", "Game Name",
              "Acted On", "Price in Cents", "Type"
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
                  Are you sure you want to delete all your transactions? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
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

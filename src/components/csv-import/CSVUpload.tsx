import React, { useRef, useState, useCallback } from "react";
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
import { parseCSVFile, validateAndConvertData } from "@/lib/csv";
import { NewTransaction } from "@/types/transaction";
import { UploadConfirmationDialog } from "./UploadConfirmationDialog";

interface CSVUploadProps {
  hasData: boolean;
  insertTransactions: (transactions: NewTransaction[]) => { data: unknown; error: unknown };
  deleteAllTransactions: () => { error: unknown };
}

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

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
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
        const { data, errors } = await parseCSVFile(file);

        if (errors.length > 0) {
          console.warn("CSV parsing warnings:", errors);
        }

        const validatedTransactions = validateAndConvertData(data);

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
        // Reset file input
        event.target.value = "";
      }
    },
    [toast]
  );

  const handleConfirmImport = useCallback(() => {
    const result = insertTransactions(pendingTransactions);

    if (!result.error) {
      setShowConfirmDialog(false);
      setPendingTransactions([]);
    }
  }, [insertTransactions, pendingTransactions]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClearData = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    deleteAllTransactions();
    setShowDeleteDialog(false);
  }, [deleteAllTransactions]);

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

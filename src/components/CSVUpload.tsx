import { useRef, useEffect } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Transaction } from "@/types/transaction";

interface CSVUploadProps {
  onDataLoaded: (data: Transaction[]) => void;
  hasData: boolean;
  user: User | null;
  onShowAuthModal: () => void;
}

export const CSVUpload = ({ onDataLoaded, hasData, user, onShowAuthModal }: CSVUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const validateAndConvertData = (rawData: any[]): Transaction[] => {
    const requiredFields = ["item", "game", "date", "price_cents", "type"];
    
    if (rawData.length === 0) {
      throw new Error("The CSV file is empty");
    }

    const firstRow = rawData[0];
    const headers = Object.keys(firstRow).map(normalizeHeader);
    
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      throw new Error(`Required fields missing: ${missingFields.join(", ")}`);
    }

    return rawData.map((row, index) => {
      const normalizedRow: any = {};
      
      Object.keys(row).forEach(key => {
        const normalizedKey = normalizeHeader(key);
        normalizedRow[normalizedKey] = row[key];
      });

      const item = normalizedRow.item?.trim();
      const game = normalizedRow.game?.trim();
      const date = normalizedRow.date?.trim();
      const priceString = normalizedRow.price_cents?.toString().trim();
      const type = normalizedRow.type?.toLowerCase().trim();

      if (!item || !game || !date || !priceString || !type) {
        throw new Error(`Row ${index + 1}: Incomplete data`);
      }

      const price_cents = parseInt(priceString);
      if (isNaN(price_cents) || price_cents < 0) {
        throw new Error(`Row ${index + 1}: Invalid price (${priceString})`);
      }

      if (type !== "purchase" && type !== "sale") {
        throw new Error(`Row ${index + 1}: Type must be 'purchase' or 'sale' (received: ${type})`);
      }

      return {
        id: index + 1,
        item,
        game,
        date,
        price_cents,
        type: type as "purchase" | "sale"
      };
    });
  };

  const saveTransactionsToDatabase = async (transactions: Transaction[]): Promise<Transaction[]> => {
    if (!user) throw new Error("User not authenticated");

    const savedTransactions: Transaction[] = [];

    for (const transaction of transactions) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            item: transaction.item,
            game: transaction.game,
            date: transaction.date,
            price_cents: transaction.price_cents,
            type: transaction.type,
          })
          .select()
          .single();

        if (error) {
          // If it's a unique constraint violation, skip this transaction
          if (error.code === '23505') {
            continue;
          }
          throw error;
        }

        if (data) {
          savedTransactions.push({
            id: data.id,
            item: data.item,
            game: data.game,
            date: data.date,
            price_cents: data.price_cents,
            type: data.type as "purchase" | "sale",
          });
        }
      } catch (error) {
        console.error('Error saving transaction:', error);
      }
    }

    return savedTransactions;
  };

  const loadUserTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        // Don't show error to user for initial load failures
        // Just keep the app working with empty data
        return;
      }

      const formattedTransactions: Transaction[] = data.map(transaction => ({
        id: transaction.id,
        item: transaction.item,
        game: transaction.game,
        date: transaction.date,
        price_cents: transaction.price_cents,
        type: transaction.type as "purchase" | "sale",
      }));

      onDataLoaded(formattedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Keep the app working even if database is unavailable
      // Don't show error toast for initial loads
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Check if user is authenticated
    if (!user) {
      onShowAuthModal();
      event.target.value = '';
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid format",
        description: "Please select a valid CSV file",
        variant: "destructive"
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          if (results.errors.length > 0) {
            throw new Error(`CSV Error: ${results.errors[0].message}`);
          }

          const validatedData = validateAndConvertData(results.data);
          
          // Save to database and get unique transactions
          const savedTransactions = await saveTransactionsToDatabase(validatedData);
          
          if (savedTransactions.length === 0) {
            toast({
              title: "No New Data",
              description: "All transactions from this CSV were already imported.",
            });
          } else {
            toast({
              title: "Success",
              description: `Successfully imported ${savedTransactions.length} new transactions.`,
            });
          }

          // Load all user transactions from database
          await loadUserTransactions();

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          toast({
            title: "Error processing CSV",
            description: error instanceof Error ? error.message : "Unknown error",
            variant: "destructive"
          });
        }
      },
      error: (error) => {
        toast({
          title: "Reading error",
          description: `Failed to read file: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };

  const triggerFileInput = () => {
    if (!user) {
      onShowAuthModal();
      return;
    }
    fileInputRef.current?.click();
  };

  // Load user transactions when user changes
  useEffect(() => {
    if (user) {
      loadUserTransactions();
    } else {
      onDataLoaded([]);
    }
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-8 bg-gradient-card border border-border/50 backdrop-blur-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-steam-blue/5 to-primary/5 pointer-events-none" />
        
        <div className="relative space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Import CSV Data
              </h3>
              <p className="text-muted-foreground">
                {!user ? "Sign in to upload and save your Steam Market transaction data" : "Upload the CSV file exported from Steam Market for detailed analysis of your transactions"}
              </p>
            </div>
          </div>

          <Alert className="border-steam-blue/20 bg-steam-blue/5">
            <Info className="h-4 w-4 text-steam-blue" />
            <AlertDescription className="text-sm text-foreground">
              <strong>Expected format:</strong> CSV must contain columns: "Item Name", "Game Name", "Acted On", "Price in Cents", "Type" (purchase/sale)
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              onClick={triggerFileInput}
              className="bg-gradient-primary text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-primary/25"
            >
              <Upload className="h-4 w-4 mr-2" />
              {hasData ? "Replace Data" : "Import CSV"}
            </Button>
            
            {hasData && user && (
              <Button 
                variant="outline" 
                onClick={() => onDataLoaded([])}
                className="border-border/50 text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                Clear Data
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </Card>
    </div>
  );
};
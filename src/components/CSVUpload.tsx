import { useRef } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: number;
  item: string;
  game: string;
  date: string;
  price_cents: number;
  type: "purchase" | "sale";
}

interface CSVUploadProps {
  onDataLoaded: (data: Transaction[]) => void;
  hasData: boolean;
}

export const CSVUpload = ({ onDataLoaded, hasData }: CSVUploadProps) => {
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
      throw new Error("O ficheiro CSV está vazio");
    }

    const firstRow = rawData[0];
    const headers = Object.keys(firstRow).map(normalizeHeader);
    
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios em falta: ${missingFields.join(", ")}`);
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
        throw new Error(`Linha ${index + 1}: Dados incompletos`);
      }

      const price_cents = parseInt(priceString);
      if (isNaN(price_cents) || price_cents < 0) {
        throw new Error(`Linha ${index + 1}: Preço inválido (${priceString})`);
      }

      if (type !== "purchase" && type !== "sale") {
        throw new Error(`Linha ${index + 1}: Tipo deve ser 'purchase' ou 'sale' (recebido: ${type})`);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um ficheiro CSV válido",
        variant: "destructive"
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            throw new Error(`Erro no CSV: ${results.errors[0].message}`);
          }

          const validatedData = validateAndConvertData(results.data);
          
          onDataLoaded(validatedData);
          
          toast({
            title: "Upload concluído",
            description: `${validatedData.length} transações carregadas com sucesso`,
          });

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          toast({
            title: "Erro ao processar CSV",
            description: error instanceof Error ? error.message : "Erro desconhecido",
            variant: "destructive"
          });
        }
      },
      error: (error) => {
        toast({
          title: "Erro de leitura",
          description: `Falha ao ler o ficheiro: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
                Importar Dados CSV
              </h3>
              <p className="text-muted-foreground">
                Carregue o ficheiro CSV exportado da Steam Market para análise detalhada das suas transações
              </p>
            </div>
          </div>

          <Alert className="border-steam-blue/20 bg-steam-blue/5">
            <Info className="h-4 w-4 text-steam-blue" />
            <AlertDescription className="text-sm text-foreground">
              <strong>Formato esperado:</strong> O CSV deve conter as colunas: "Item Name", "Game Name", "Acted On", "Price in Cents", "Type" (purchase/sale)
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              onClick={triggerFileInput}
              className="bg-gradient-primary text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-primary/25"
            >
              <Upload className="h-4 w-4 mr-2" />
              {hasData ? "Substituir Dados" : "Importar CSV"}
            </Button>
            
            {hasData && (
              <Button 
                variant="outline" 
                onClick={() => onDataLoaded([])}
                className="border-border/50 text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                Limpar Dados
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
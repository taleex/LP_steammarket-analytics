import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: number;
  "Item Name": string;
  "Game Name": string;
  "Acted On": string;
  " Price in Cents": number;
  " Type": "purchase" | "sale";
}

const mockData: Transaction[] = [
  {
    id: 1,
    "Item Name": "AK-47 | Redline (Field-Tested)",
    "Game Name": "Counter-Strike 2",
    "Acted On": "2024-01-15T10:30:00Z",
    " Price in Cents": 2850,
    " Type": "purchase"
  },
  {
    id: 2,
    "Item Name": "AWP | Dragon Lore (Factory New)",
    "Game Name": "Counter-Strike 2",
    "Acted On": "2024-01-20T14:45:00Z",
    " Price in Cents": 125000,
    " Type": "sale"
  },
  {
    id: 3,
    "Item Name": "Glock-18 | Fade (Factory New)",
    "Game Name": "Counter-Strike 2",
    "Acted On": "2024-01-25T09:15:00Z",
    " Price in Cents": 1200,
    " Type": "purchase"
  },
  {
    id: 4,
    "Item Name": "M4A4 | Howl (Minimal Wear)",
    "Game Name": "Counter-Strike 2",
    "Acted On": "2024-02-01T16:20:00Z",
    " Price in Cents": 85000,
    " Type": "sale"
  },
  {
    id: 5,
    "Item Name": "Karambit | Doppler Phase 2",
    "Game Name": "Counter-Strike 2",
    "Acted On": "2024-02-05T11:30:00Z",
    " Price in Cents": 95000,
    " Type": "purchase"
  },
  {
    id: 6,
    "Item Name": "StatTrak™ AK-47 | Fire Serpent",
    "Game Name": "Counter-Strike 2",
    "Acted On": "2024-02-10T13:45:00Z",
    " Price in Cents": 180000,
    " Type": "sale"
  }
];

export const TransactionTable = () => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totals = useMemo(() => {
    let totalGains = 0;
    let totalSpent = 0;

    selectedItems.forEach(id => {
      const transaction = mockData.find(t => t.id === id);
      if (transaction) {
        if (transaction[" Type"] === "sale") {
          totalGains += transaction[" Price in Cents"];
        } else {
          totalSpent += transaction[" Price in Cents"];
        }
      }
    });

    return {
      gains: totalGains,
      spent: totalSpent,
      net: totalGains - totalSpent
    };
  }, [selectedItems]);

  const handleSelectItem = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(mockData.map(t => t.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border border-border">
          <div className="text-sm text-muted-foreground">Total Ganho</div>
          <div className="text-2xl font-bold text-profit">
            {formatPrice(totals.gains)}
          </div>
        </Card>
        <Card className="p-4 bg-card border border-border">
          <div className="text-sm text-muted-foreground">Total Gasto</div>
          <div className="text-2xl font-bold text-loss">
            {formatPrice(totals.spent)}
          </div>
        </Card>
        <Card className="p-4 bg-card border border-border">
          <div className="text-sm text-muted-foreground">Saldo</div>
          <div className={`text-2xl font-bold ${totals.net >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatPrice(totals.net)}
          </div>
        </Card>
        <Card className="p-4 bg-card border border-border">
          <div className="text-sm text-muted-foreground">Items Selecionados</div>
          <div className="text-2xl font-bold text-foreground">
            {selectedItems.size}
          </div>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className="p-0 bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-semibold text-foreground">
                  <Checkbox
                    checked={selectedItems.size === mockData.length}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-semibold text-foreground">Item</th>
                <th className="text-left p-4 font-semibold text-foreground">Jogo</th>
                <th className="text-left p-4 font-semibold text-foreground">Data</th>
                <th className="text-left p-4 font-semibold text-foreground">Tipo</th>
                <th className="text-left p-4 font-semibold text-foreground">Preço</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className={`border-b border-border hover:bg-muted/20 transition-colors ${
                    selectedItems.has(transaction.id) ? 'bg-muted/10' : ''
                  }`}
                >
                  <td className="p-4">
                    <Checkbox
                      checked={selectedItems.has(transaction.id)}
                      onCheckedChange={(checked) => 
                        handleSelectItem(transaction.id, checked as boolean)
                      }
                    />
                  </td>
                  <td className="p-4 text-foreground font-medium max-w-xs">
                    <div className="truncate" title={transaction["Item Name"]}>
                      {transaction["Item Name"]}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {transaction["Game Name"]}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(transaction["Acted On"])}
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={transaction[" Type"] === "sale" ? "default" : "secondary"}
                      className={transaction[" Type"] === "sale" ? 
                        "bg-profit text-profit-foreground" : 
                        "bg-loss text-loss-foreground"
                      }
                    >
                      {transaction[" Type"] === "sale" ? "Venda" : "Compra"}
                    </Badge>
                  </td>
                  <td className={`p-4 font-semibold ${
                    transaction[" Type"] === "sale" ? "text-profit" : "text-loss"
                  }`}>
                    {formatPrice(transaction[" Price in Cents"])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
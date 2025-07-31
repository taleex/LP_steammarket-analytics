import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: number;
  item: string;
  game: string;
  date: string;
  price_cents: number;
  type: "purchase" | "sale";
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const mockData: Transaction[] = [
  {
    id: 1,
    item: "AK-47 | Redline (Field-Tested)",
    game: "Counter-Strike 2",
    date: "2024-01-15T10:30:00Z",
    price_cents: 2850,
    type: "purchase"
  },
  {
    id: 2,
    item: "AWP | Dragon Lore (Factory New)",
    game: "Counter-Strike 2", 
    date: "2024-01-20T14:45:00Z",
    price_cents: 125000,
    type: "sale"
  },
  {
    id: 3,
    item: "Glock-18 | Fade (Factory New)",
    game: "Counter-Strike 2",
    date: "2024-01-25T09:15:00Z",
    price_cents: 1200,
    type: "purchase"
  },
  {
    id: 4,
    item: "M4A4 | Howl (Minimal Wear)",
    game: "Counter-Strike 2",
    date: "2024-02-01T16:20:00Z",
    price_cents: 85000,
    type: "sale"
  },
  {
    id: 5,
    item: "Karambit | Doppler Phase 2",
    game: "Counter-Strike 2",
    date: "2024-02-05T11:30:00Z",
    price_cents: 95000,
    type: "purchase"
  },
  {
    id: 6,
    item: "StatTrak™ AK-47 | Fire Serpent",
    game: "Counter-Strike 2",
    date: "2024-02-10T13:45:00Z",
    price_cents: 180000,
    type: "sale"
  }
];

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Use os dados passados como prop ou dados mock se vazio
  const data = transactions.length > 0 ? transactions : mockData;

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
      const transaction = data.find(t => t.id === id);
      if (transaction) {
        if (transaction.type === "sale") {
          totalGains += transaction.price_cents;
        } else {
          totalSpent += transaction.price_cents;
        }
      }
    });

    return {
      gains: totalGains,
      spent: totalSpent,
      net: totalGains - totalSpent
    };
  }, [selectedItems, data]);

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
      setSelectedItems(new Set(data.map(t => t.id)));
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
                    checked={selectedItems.size === data.length}
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
              {data.map((transaction) => (
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
                    <div className="truncate" title={transaction.item}>
                      {transaction.item}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {transaction.game}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={transaction.type === "sale" ? "default" : "secondary"}
                      className={transaction.type === "sale" ? 
                        "bg-profit text-profit-foreground" : 
                        "bg-loss text-loss-foreground"
                      }
                    >
                      {transaction.type === "sale" ? "Venda" : "Compra"}
                    </Badge>
                  </td>
                  <td className={`p-4 font-semibold ${
                    transaction.type === "sale" ? "text-profit" : "text-loss"
                  }`}>
                    {formatPrice(transaction.price_cents)}
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
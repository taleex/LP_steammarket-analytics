import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X, ChevronDown } from "lucide-react";

interface Transaction {
  id: number;
  item: string;
  game: string;
  date: string;
  price_cents: number;
  type: "purchase" | "sale";
}

interface TransactionFiltersProps {
  transactions: Transaction[];
  onFilteredTransactions: (filtered: Transaction[]) => void;
}

export const TransactionFilters = ({ transactions, onFilteredTransactions }: TransactionFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filteredCount, setFilteredCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Get unique games from transactions
  const uniqueGames = Array.from(new Set(transactions.map(t => t.game))).sort();

  const applyFilters = () => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Game filter
    if (selectedGame !== "all") {
      filtered = filtered.filter(transaction => transaction.game === selectedGame);
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(transaction => transaction.type === selectedType);
    }

    // Price range filter
    if (minPrice) {
      const minPriceCents = parseFloat(minPrice) * 100;
      filtered = filtered.filter(transaction => transaction.price_cents >= minPriceCents);
    }

    if (maxPrice) {
      const maxPriceCents = parseFloat(maxPrice) * 100;
      filtered = filtered.filter(transaction => transaction.price_cents <= maxPriceCents);
    }

    setFilteredCount(filtered.length);
    onFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGame("all");
    setSelectedType("all");
    setMinPrice("");
    setMaxPrice("");
    onFilteredTransactions(transactions);
  };

  const hasActiveFilters = searchTerm || selectedGame !== "all" || selectedType !== "all" || minPrice || maxPrice;

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedGame, selectedType, minPrice, maxPrice, transactions]);

  return (
    <section aria-labelledby="filters-title">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Buscar itens"
          />
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-80 p-0 z-50">
            <Card className="p-4 bg-gradient-card border border-border/50">
              <div className="space-y-4">
                <h3 id="filters-title" className="text-base font-semibold text-foreground">Filtros</h3>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <Label>Jogo</Label>
                    <Select value={selectedGame} onValueChange={setSelectedGame}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os jogos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os jogos</SelectItem>
                        {uniqueGames.map(game => (
                          <SelectItem key={game} value={game}>{game}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label>Tipo</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="purchase">Compras</SelectItem>
                        <SelectItem value="sale">Vendas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="minPrice">Preço mín. (€)</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="0.00"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="maxPrice">Preço máx. (€)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="0.00"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="secondary">
                      {filteredCount} de {transactions.length} exibidos
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Limpar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

    </section>
  );
};
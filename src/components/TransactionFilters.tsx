import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <CollapsibleTrigger asChild>
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-auto">
              {filteredCount} de {transactions.length} exibidos
            </Badge>
          )}
        </div>

        <CollapsibleContent>
          <Card className="p-6 bg-gradient-card border border-border/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 id="filters-title" className="text-lg font-semibold text-foreground">Filtros e busca</h3>
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 ml-auto" aria-label="Filtros ativos">
                    {searchTerm && <Badge variant="secondary">Busca: {searchTerm}</Badge>}
                    {selectedGame !== "all" && <Badge variant="secondary">Jogo: {selectedGame}</Badge>}
                    {selectedType !== "all" && <Badge variant="secondary">Tipo: {selectedType === "purchase" ? "Compras" : "Vendas"}</Badge>}
                    {minPrice && <Badge variant="secondary">Min: €{minPrice}</Badge>}
                    {maxPrice && <Badge variant="secondary">Max: €{maxPrice}</Badge>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar itens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Game Filter */}
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

                {/* Type Filter */}
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

                {/* Min Price */}
                <Input
                  type="number"
                  placeholder="Preço mín. (€)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  step="0.01"
                  min="0"
                />

                {/* Max Price */}
                <Input
                  type="number"
                  placeholder="Preço máx. (€)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};
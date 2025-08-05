import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { Transaction } from "@/types/transaction";

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
    <Card className="p-6 bg-gradient-card border border-border/50 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Filters & Search</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-auto">
              {filteredCount} of {transactions.length} shown
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Game Filter */}
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger>
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              {uniqueGames.map(game => (
                <SelectItem key={game} value={game}>{game}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="purchase">Purchases</SelectItem>
              <SelectItem value="sale">Sales</SelectItem>
            </SelectContent>
          </Select>

          {/* Min Price */}
          <Input
            type="number"
            placeholder="Min Price (€)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            step="0.01"
            min="0"
          />

          {/* Max Price */}
          <Input
            type="number"
            placeholder="Max Price (€)"
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
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
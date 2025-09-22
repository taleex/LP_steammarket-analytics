import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { useDebounce } from "@/hooks/use-debounce";
import { parseTransactionDate } from "@/lib/date";
import { Transaction } from "@/hooks/use-transactions";

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
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [filteredCount, setFilteredCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Debounced inputs to improve typing/click UX
  const debouncedSearchTerm = useDebounce(searchTerm, 250);
  const debouncedMinPrice = useDebounce(minPrice, 250);
  const debouncedMaxPrice = useDebounce(maxPrice, 250);


  // Get unique games from transactions
  const uniqueGames = Array.from(new Set(transactions.map(t => t.game))).sort();

  // Price bounds derived from data (in €)
  const pricesEuros = transactions.map((t) => t.price_cents / 100)
  let minBound = pricesEuros.length ? Math.floor(Math.min(...pricesEuros)) : 0
  let maxBound = pricesEuros.length ? Math.ceil(Math.max(...pricesEuros)) : 1000
  if (maxBound <= minBound) {
    maxBound = minBound + 1
  }

  // Slider display state mirrors min/max filters
  const [priceRange, setPriceRange] = useState<number[]>([minBound, maxBound])
  useEffect(() => {
    const from = minPrice ? parseFloat(minPrice) : minBound
    const to = maxPrice ? parseFloat(maxPrice) : maxBound
    const clampedFrom = Math.max(minBound, Math.min(from, maxBound))
    const clampedTo = Math.max(minBound, Math.min(to, maxBound))
    setPriceRange([clampedFrom, clampedTo])
  }, [minPrice, maxPrice, minBound, maxBound])



  const applyFilters = () => {
    let filtered = transactions;

    // Search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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

    // Date range filter
    if (startDate) {
      const start = startOfDay(startDate);
      filtered = filtered.filter((transaction) => {
        const parsed = parseTransactionDate(transaction.date);
        return parsed.date && parsed.date >= start;
      });
    }

    if (endDate) {
      const end = endOfDay(endDate);
      filtered = filtered.filter((transaction) => {
        const parsed = parseTransactionDate(transaction.date);
        return parsed.date && parsed.date <= end;
      });
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
    setStartDate(undefined);
    setEndDate(undefined);
    setPriceRange([minBound, maxBound]);
    onFilteredTransactions(transactions);
  };

  const hasActiveFilters = searchTerm || selectedGame !== "all" || selectedType !== "all" || minPrice || maxPrice || startDate || endDate;

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [debouncedSearchTerm, selectedGame, selectedType, debouncedMinPrice, debouncedMaxPrice, startDate, endDate, transactions]);

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

          <PopoverContent align="end" className="w-[400px] p-0 z-50">
            <div className="bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 id="filters-title" className="text-lg font-semibold text-foreground">Filtros</h3>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="text-xs">
                      {filteredCount} resultados
                    </Badge>
                  )}
                </div>

                {/* Filter Grid */}
                <div className="grid gap-4">
                  {/* Game and Type in same row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Jogo</Label>
                      <Select value={selectedGame} onValueChange={setSelectedGame}>
                        <SelectTrigger className="h-10 border-input/60 bg-background hover:bg-accent/50 hover:border-input transition-colors">
                          <SelectValue placeholder="Todos os jogos" />
                        </SelectTrigger>
                        <SelectContent 
                          className="max-h-[200px] border-border/50 shadow-lg overflow-y-auto"
                          style={{ width: 'var(--radix-select-trigger-width)' }}
                          position="popper"
                          sideOffset={4}
                        >
                          <SelectItem value="all" className="focus:bg-accent/80 cursor-pointer">Todos os jogos</SelectItem>
                          {uniqueGames.map(game => (
                            <SelectItem key={game} value={game} className="focus:bg-accent/80 cursor-pointer">{game}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Tipo</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="h-10 border-input/60 bg-background hover:bg-accent/50 hover:border-input transition-colors">
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent 
                          className="max-h-[200px] border-border/50 shadow-lg overflow-y-auto"
                          style={{ width: 'var(--radix-select-trigger-width)' }}
                          position="popper"
                          sideOffset={4}
                        >
                          <SelectItem value="all" className="focus:bg-accent/80 cursor-pointer">Todos os tipos</SelectItem>
                          <SelectItem value="purchase" className="focus:bg-accent/80 cursor-pointer">Compras</SelectItem>
                          <SelectItem value="sale" className="focus:bg-accent/80 cursor-pointer">Vendas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Data início</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`h-9 w-full justify-start text-left font-normal ${!startDate ? "text-muted-foreground" : ""}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
                            {startDate ? format(startDate, "dd/MM/yy") : "Início"}
                          </Button>
                        </PopoverTrigger>
                         <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                             mode="single"
                             selected={startDate}
                             onSelect={setStartDate}
                             initialFocus
                             className="p-2 pointer-events-auto"
                             showOutsideDays={false}
                             captionLayout="dropdown-buttons"
                             fromYear={2000}
                             toYear={new Date().getFullYear()}
                           />
                         </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Data fim</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`h-9 w-full justify-start text-left font-normal ${!endDate ? "text-muted-foreground" : ""}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
                            {endDate ? format(endDate, "dd/MM/yy") : "Fim"}
                          </Button>
                        </PopoverTrigger>
                         <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                             mode="single"
                             selected={endDate}
                             onSelect={setEndDate}
                             initialFocus
                             className="p-2 pointer-events-auto"
                             showOutsideDays={false}
                             captionLayout="dropdown-buttons"
                             fromYear={2000}
                             toYear={new Date().getFullYear()}
                           />
                         </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Faixa de preço</Label>
                    <div className="px-2 py-1">
                      <Slider
                        value={priceRange}
                        min={minBound}
                        max={maxBound}
                        step={1}
                        minStepsBetweenThumbs={1}
                        onValueChange={(v) => setPriceRange(v as number[])}
                        onValueCommit={(v) => {
                          const [from, to] = v as number[]
                          setMinPrice(String(from))
                          setMaxPrice(String(to))
                        }}
                        className="w-full"
                        aria-label="Faixa de preço"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-secondary/50 px-2 py-1 rounded text-xs font-medium">
                        €{Number(priceRange?.[0] ?? minBound)}
                      </span>
                      <span className="text-muted-foreground text-xs">até</span>
                      <span className="bg-secondary/50 px-2 py-1 rounded text-xs font-medium">
                        €{Number(priceRange?.[1] ?? maxBound)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="text-sm text-muted-foreground">
                      {filteredCount} de {transactions.length} transações
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-3 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Limpar tudo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

    </section>
  );
};
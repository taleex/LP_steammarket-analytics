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

    // Date range filter
    if (startDate) {
      const start = startOfDay(startDate);
      filtered = filtered.filter((transaction) => {
        const d = new Date(transaction.date);
        return !isNaN(d.getTime()) && d >= start;
      });
    }

    if (endDate) {
      const end = endOfDay(endDate);
      filtered = filtered.filter((transaction) => {
        const d = new Date(transaction.date);
        return !isNaN(d.getTime()) && d <= end;
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

          <PopoverContent align="end" className="w-96 p-0 z-50">
            <Card className="p-5 bg-popover border border-border/60 rounded-lg shadow-lg">
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

                  {/* Data início */}
                  <div className="flex flex-col gap-1">
                    <Label>Data início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`justify-start font-normal ${!startDate ? "text-muted-foreground" : ""}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                          {startDate ? format(startDate, "dd/MM/yyyy") : <span>Escolher data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Data fim */}
                  <div className="flex flex-col gap-1">
                    <Label>Data fim</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`justify-start font-normal ${!endDate ? "text-muted-foreground" : ""}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                          {endDate ? format(endDate, "dd/MM/yyyy") : <span>Escolher data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Faixa de preço (€)</Label>
                    <div className="px-1">
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
                        aria-label="Faixa de preço"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>€{Number(priceRange?.[0] ?? minBound).toFixed(0)}</span>
                      <span>€{Number(priceRange?.[1] ?? maxBound).toFixed(0)}</span>
                    </div>
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
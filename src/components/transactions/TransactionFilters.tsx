import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { useDebounce } from "@/hooks/use-debounce";
import { parseTransactionDate } from "@/lib/date";
import { Transaction } from "@/types/transaction";

interface TransactionFiltersProps {
  transactions: Transaction[];
  onFilteredTransactions: (filtered: Transaction[]) => void;
}

interface FilterState {
  searchTerm: string;
  selectedGame: string;
  selectedType: string;
  minPrice: string;
  maxPrice: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const INITIAL_FILTER_STATE: FilterState = {
  searchTerm: "",
  selectedGame: "all",
  selectedType: "all",
  minPrice: "",
  maxPrice: "",
  startDate: undefined,
  endDate: undefined,
};

export const TransactionFilters = ({
  transactions,
  onFilteredTransactions,
}: TransactionFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [filteredCount, setFilteredCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Debounced inputs
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 250);
  const debouncedMinPrice = useDebounce(filters.minPrice, 250);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 250);

  // Derived data
  const uniqueGames = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.game))).sort(),
    [transactions]
  );

  const { minBound, maxBound } = useMemo(() => {
    const pricesEuros = transactions.map((t) => t.price_cents / 100);
    let min = pricesEuros.length ? Math.floor(Math.min(...pricesEuros)) : 0;
    let max = pricesEuros.length ? Math.ceil(Math.max(...pricesEuros)) : 1000;
    if (max <= min) max = min + 1;
    return { minBound: min, maxBound: max };
  }, [transactions]);

  const [priceRange, setPriceRange] = useState<number[]>([minBound, maxBound]);

  useEffect(() => {
    const from = filters.minPrice ? parseFloat(filters.minPrice) : minBound;
    const to = filters.maxPrice ? parseFloat(filters.maxPrice) : maxBound;
    const clampedFrom = Math.max(minBound, Math.min(from, maxBound));
    const clampedTo = Math.max(minBound, Math.min(to, maxBound));
    setPriceRange([clampedFrom, clampedTo]);
  }, [filters.minPrice, filters.maxPrice, minBound, maxBound]);

  const hasActiveFilters =
    filters.searchTerm ||
    filters.selectedGame !== "all" ||
    filters.selectedType !== "all" ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.startDate ||
    filters.endDate;

  // Apply filters
  useEffect(() => {
    let filtered = transactions;

    if (debouncedSearchTerm) {
      filtered = filtered.filter((t) =>
        t.item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (filters.selectedGame !== "all") {
      filtered = filtered.filter((t) => t.game === filters.selectedGame);
    }

    if (filters.selectedType !== "all") {
      filtered = filtered.filter((t) => t.type === filters.selectedType);
    }

    if (debouncedMinPrice) {
      const minPriceCents = parseFloat(debouncedMinPrice) * 100;
      filtered = filtered.filter((t) => t.price_cents >= minPriceCents);
    }

    if (debouncedMaxPrice) {
      const maxPriceCents = parseFloat(debouncedMaxPrice) * 100;
      filtered = filtered.filter((t) => t.price_cents <= maxPriceCents);
    }

    if (filters.startDate) {
      const start = startOfDay(filters.startDate);
      filtered = filtered.filter((t) => {
        const parsed = parseTransactionDate(t.date);
        return parsed.date && parsed.date >= start;
      });
    }

    if (filters.endDate) {
      const end = endOfDay(filters.endDate);
      filtered = filtered.filter((t) => {
        const parsed = parseTransactionDate(t.date);
        return parsed.date && parsed.date <= end;
      });
    }

    setFilteredCount(filtered.length);
    onFilteredTransactions(filtered);
  }, [
    debouncedSearchTerm,
    filters.selectedGame,
    filters.selectedType,
    debouncedMinPrice,
    debouncedMaxPrice,
    filters.startDate,
    filters.endDate,
    transactions,
    onFilteredTransactions,
  ]);

  const clearFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
    setPriceRange([minBound, maxBound]);
    onFilteredTransactions(transactions);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section aria-labelledby="filters-title">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter("searchTerm", e.target.value)}
            className="pl-10"
            aria-label="Search items"
          />
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-[400px] p-0 z-50">
            <div className="bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 id="filters-title" className="text-lg font-semibold text-foreground">
                    Filters
                  </h3>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="text-xs">
                      {filteredCount} results
                    </Badge>
                  )}
                </div>

                {/* Filter Grid */}
                <div className="grid gap-4">
                  {/* Game and Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Game</Label>
                      <Select
                        value={filters.selectedGame}
                        onValueChange={(v) => updateFilter("selectedGame", v)}
                      >
                        <SelectTrigger className="h-10 border-input/60 bg-background hover:bg-accent/50 hover:border-input transition-colors">
                          <SelectValue placeholder="All games" />
                        </SelectTrigger>
                        <SelectContent
                          className="max-h-[200px] border-border/50 shadow-lg overflow-y-auto"
                          style={{ width: "var(--radix-select-trigger-width)" }}
                          position="popper"
                          sideOffset={4}
                        >
                          <SelectItem value="all" className="focus:bg-accent/80 cursor-pointer">
                            All games
                          </SelectItem>
                          {uniqueGames.map((game) => (
                            <SelectItem
                              key={game}
                              value={game}
                              className="focus:bg-accent/80 cursor-pointer"
                            >
                              {game}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Type</Label>
                      <Select
                        value={filters.selectedType}
                        onValueChange={(v) => updateFilter("selectedType", v)}
                      >
                        <SelectTrigger className="h-10 border-input/60 bg-background hover:bg-accent/50 hover:border-input transition-colors">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent
                          className="max-h-[200px] border-border/50 shadow-lg overflow-y-auto"
                          style={{ width: "var(--radix-select-trigger-width)" }}
                          position="popper"
                          sideOffset={4}
                        >
                          <SelectItem value="all" className="focus:bg-accent/80 cursor-pointer">
                            All types
                          </SelectItem>
                          <SelectItem
                            value="purchase"
                            className="focus:bg-accent/80 cursor-pointer"
                          >
                            Purchases
                          </SelectItem>
                          <SelectItem value="sale" className="focus:bg-accent/80 cursor-pointer">
                            Sales
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Start date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`h-9 w-full justify-start text-left font-normal ${
                              !filters.startDate ? "text-muted-foreground" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
                            {filters.startDate ? format(filters.startDate, "dd/MM/yy") : "Start"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.startDate}
                            onSelect={(d) => updateFilter("startDate", d)}
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
                      <Label className="text-sm font-medium text-foreground">End date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`h-9 w-full justify-start text-left font-normal ${
                              !filters.endDate ? "text-muted-foreground" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
                            {filters.endDate ? format(filters.endDate, "dd/MM/yy") : "End"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.endDate}
                            onSelect={(d) => updateFilter("endDate", d)}
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
                    <Label className="text-sm font-medium text-foreground">Price range</Label>
                    <div className="px-2 py-1">
                      <Slider
                        value={priceRange}
                        min={minBound}
                        max={maxBound}
                        step={1}
                        minStepsBetweenThumbs={1}
                        onValueChange={(v) => setPriceRange(v as number[])}
                        onValueCommit={(v) => {
                          const [from, to] = v as number[];
                          updateFilter("minPrice", String(from));
                          updateFilter("maxPrice", String(to));
                        }}
                        className="w-full"
                        aria-label="Price range"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-secondary/50 px-2 py-1 rounded text-xs font-medium">
                        €{Number(priceRange?.[0] ?? minBound)}
                      </span>
                      <span className="text-muted-foreground text-xs">to</span>
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
                      {filteredCount} of {transactions.length} transactions
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-3 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear all
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

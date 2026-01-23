import { useState } from "react";
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
import { Search, Filter, X, ChevronDown, Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { Transaction } from "@/types/transaction";
import { useTransactionFilters } from "@/hooks/transactions/use-transaction-filters";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface TransactionFiltersProps {
  transactions: Transaction[];
  onFilteredTransactions: (filtered: Transaction[]) => void;
}

export const TransactionFilters = ({
  transactions,
  onFilteredTransactions,
}: TransactionFiltersProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGameSearchOpen, setIsGameSearchOpen] = useState(false);

  const {
    filters,
    filteredCount,
    uniqueGames,
    priceRange,
    minBound,
    maxBound,
    hasActiveFilters,
    updateFilter,
    updatePriceRange,
    clearFilters,
  } = useTransactionFilters({ transactions, onFilteredTransactions });

  const handlePriceRangeCommit = (values: number[]) => {
    const [from, to] = values;
    updateFilter("minPrice", String(from));
    updateFilter("maxPrice", String(to));
  };

  return (
    <section aria-labelledby="filters-title">
      <div className="flex items-center gap-3 mb-4">
        {/* Search Input */}
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

        {/* Filters Popover */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
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

                {/* Filter Controls */}
                <div className="grid gap-4">
                  {/* Game and Type Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Game Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Game</Label>
                      <Popover open={isGameSearchOpen} onOpenChange={setIsGameSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isGameSearchOpen}
                            className="h-10 w-full justify-between border-input/60 bg-background hover:bg-accent/50 hover:border-input transition-colors font-normal"
                          >
                            <span className="truncate">
                              {filters.selectedGame === "all"
                                ? "All games"
                                : filters.selectedGame}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search games..." />
                            <CommandList>
                              <CommandEmpty>No game found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="all"
                                  onSelect={() => {
                                    updateFilter("selectedGame", "all");
                                    setIsGameSearchOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      filters.selectedGame === "all" ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  All games
                                </CommandItem>
                                {uniqueGames.map((game) => (
                                  <CommandItem
                                    key={game}
                                    value={game}
                                    onSelect={() => {
                                      updateFilter("selectedGame", game);
                                      setIsGameSearchOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        filters.selectedGame === game ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {game}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Type Filter */}
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
                          <SelectItem value="purchase" className="focus:bg-accent/80 cursor-pointer">
                            Purchases
                          </SelectItem>
                          <SelectItem value="sale" className="focus:bg-accent/80 cursor-pointer">
                            Sales
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date Range Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Start Date */}
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
                            className="pointer-events-auto"
                            showOutsideDays={false}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* End Date */}
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
                            className="pointer-events-auto"
                            showOutsideDays={false}
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
                        onValueChange={updatePriceRange}
                        onValueCommit={handlePriceRangeCommit}
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

                {/* Actions Footer */}
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

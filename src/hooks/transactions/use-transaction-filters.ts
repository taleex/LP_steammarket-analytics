import { useState, useEffect, useMemo, useCallback } from "react";
import { startOfDay, endOfDay } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";
import { parseTransactionDate } from "@/lib/date";
import { Transaction } from "@/types/transaction";
import { FilterState, INITIAL_FILTER_STATE } from "@/types/filters";

interface UseTransactionFiltersProps {
  transactions: Transaction[];
  onFilteredTransactions: (filtered: Transaction[]) => void;
}

interface UseTransactionFiltersReturn {
  filters: FilterState;
  filteredCount: number;
  uniqueGames: string[];
  priceRange: number[];
  minBound: number;
  maxBound: number;
  hasActiveFilters: boolean;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  updatePriceRange: (range: number[]) => void;
  clearFilters: () => void;
}

/**
 * Hook for managing transaction filter state and logic
 */
export const useTransactionFilters = ({
  transactions,
  onFilteredTransactions,
}: UseTransactionFiltersProps): UseTransactionFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [filteredCount, setFilteredCount] = useState(0);

  // Debounced inputs for performance
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 250);
  const debouncedMinPrice = useDebounce(filters.minPrice, 250);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 250);

  // Extract unique game names
  const uniqueGames = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.game))).sort(),
    [transactions]
  );

  // Calculate price bounds
  const { minBound, maxBound } = useMemo(() => {
    const pricesEuros = transactions.map((t) => t.price_cents / 100);
    let min = pricesEuros.length ? Math.floor(Math.min(...pricesEuros)) : 0;
    let max = pricesEuros.length ? Math.ceil(Math.max(...pricesEuros)) : 1000;
    if (max <= min) max = min + 1;
    return { minBound: min, maxBound: max };
  }, [transactions]);

  // Price range state
  const [priceRange, setPriceRange] = useState<number[]>([minBound, maxBound]);

  // Sync price range with filter values
  useEffect(() => {
    const from = filters.minPrice ? parseFloat(filters.minPrice) : minBound;
    const to = filters.maxPrice ? parseFloat(filters.maxPrice) : maxBound;
    const clampedFrom = Math.max(minBound, Math.min(from, maxBound));
    const clampedTo = Math.max(minBound, Math.min(to, maxBound));
    setPriceRange([clampedFrom, clampedTo]);
  }, [filters.minPrice, filters.maxPrice, minBound, maxBound]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.searchTerm !== "" ||
    filters.selectedGame !== "all" ||
    filters.selectedType !== "all" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.startDate !== undefined ||
    filters.endDate !== undefined;

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter((t) =>
        t.item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Game filter
    if (filters.selectedGame !== "all") {
      filtered = filtered.filter((t) => t.game === filters.selectedGame);
    }

    // Type filter
    if (filters.selectedType !== "all") {
      filtered = filtered.filter((t) => t.type === filters.selectedType);
    }

    // Min price filter
    if (debouncedMinPrice) {
      const minPriceCents = parseFloat(debouncedMinPrice) * 100;
      filtered = filtered.filter((t) => t.price_cents >= minPriceCents);
    }

    // Max price filter
    if (debouncedMaxPrice) {
      const maxPriceCents = parseFloat(debouncedMaxPrice) * 100;
      filtered = filtered.filter((t) => t.price_cents <= maxPriceCents);
    }

    // Start date filter
    if (filters.startDate) {
      const start = startOfDay(filters.startDate);
      filtered = filtered.filter((t) => {
        const parsed = parseTransactionDate(t.date);
        return parsed.date && parsed.date >= start;
      });
    }

    // End date filter
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

  // Update a single filter value
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Update price range and sync with filters
  const updatePriceRange = useCallback((range: number[]) => {
    setPriceRange(range);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
    setPriceRange([minBound, maxBound]);
    onFilteredTransactions(transactions);
  }, [minBound, maxBound, transactions, onFilteredTransactions]);

  return {
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
  };
};

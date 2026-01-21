/**
 * Filter state for transaction filtering
 */
export interface FilterState {
  searchTerm: string;
  selectedGame: string;
  selectedType: string;
  minPrice: string;
  maxPrice: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

/**
 * Initial/default filter state
 */
export const INITIAL_FILTER_STATE: FilterState = {
  searchTerm: "",
  selectedGame: "all",
  selectedType: "all",
  minPrice: "",
  maxPrice: "",
  startDate: undefined,
  endDate: undefined,
};

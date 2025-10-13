export interface SearchRequirements {
  priceRange: string | null;
  district: string | null;
  type: string | null;
  facilities: string[];
  minPrice: number | null;
  maxPrice: number | null;
  suggestedDistricts?: string[];
  alternativePriceRanges?: string[];
}

export interface SearchSuggestion {
  district: string;
  averagePrice: number;
  availableCount: number;
}

export interface PriceRange {
  min: number;
  max: number;
  description: string;
}
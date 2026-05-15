import type {
  FundCategoryEnum,
  MarketCapCategoryEnum,
  FundRiskEnum,
  FundRatingEnum,
  FundSortingFieldEnum,
  SortDirectionEnum,
} from '../masterData/fundsFilter';

export type FundSubCategoryValue = MarketCapCategoryEnum;

export type FundSortSelection = {
  value: FundSortingFieldEnum;
  value2: SortDirectionEnum;
};

export type FilterDrawerSelection = {
  sortBy: FundSortSelection | null;
  /** Map of category key → selected sub-categories ({value} objects). An entry with an empty array means the parent category is selected with no specific sub-category. */
  categoryValues: Partial<
    Record<FundCategoryEnum, Array<{ value: FundSubCategoryValue }>>
  >;
  riskValues: FundRiskEnum[];
  ratingValue: FundRatingEnum | null;
  fundHouseValues: string[];
};

export const emptyFilterDrawerSelection: FilterDrawerSelection = {
  sortBy: null,
  categoryValues: {},
  riskValues: [],
  ratingValue: null,
  fundHouseValues: [],
};

export type FundFilter = Omit<FilterDrawerSelection, 'sortBy'>;
export type FundSortBy = FundSortingFieldEnum;

export interface FundFilterOption {
  label: string;
  id: string;
}

export interface FundFilterOptions {
  categories: FundFilterOption[];
  riskLevels: FundFilterOption[];
}
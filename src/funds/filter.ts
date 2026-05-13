import type {
  FundCategoryEnum,
  FundEquitySubCategoryEnum,
  FundDebtSubCategoryEnum,
  FundHybridSubCategoryEnum,
  FundCommoditiesSubCategoryEnum,
  FundRiskEnum,
  FundRatingEnum,
  FundSortingFieldEnum,
  SortDirectionEnum,
} from '../masterData/fundsFilter';

export type FundSubCategoryValue =
  | FundEquitySubCategoryEnum
  | FundDebtSubCategoryEnum
  | FundHybridSubCategoryEnum
  | FundCommoditiesSubCategoryEnum;

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

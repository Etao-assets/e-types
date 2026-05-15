/**
 * Fund filter master data: enums, schemas, types, and constants.
 * Used in the mutual fund explore/filter panel.
 * Fund houses are an empty list in static master data and populated at runtime by the API.
 */

import { z } from 'zod';
import {
  FundCategoryEnum,
} from './fundCategoryCore';
import { MarketCapCategoryEnum } from './marketCaps';

export {
  FundCategoryEnum,
} from './fundCategoryCore';
export { MarketCapCategoryEnum } from './marketCaps';

// --- Enums ---

/** Sortable field names — used as the API/DB sort key */
export enum FundSortingFieldEnum {
  POPULARITY = 'popularity',
  RETURNS = 'returns',
  RISK = 'risk',
  NAME = 'name',
}

/** Generic sort direction — reusable across any sortable list */
export enum SortDirectionEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export enum FundRiskEnum {
  LOW = 'LOW',
  MODERATELY_LOW = 'MODERATELY_LOW',
  MODERATE = 'MODERATE',
  MODERATELY_HIGH = 'MODERATELY_HIGH',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export enum FundRatingEnum {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

// --- Schemas ---

export const FundSortingFieldSchema = z.nativeEnum(FundSortingFieldEnum);
export const SortDirectionSchema = z.nativeEnum(SortDirectionEnum);
export const FundCategorySchema = z.nativeEnum(FundCategoryEnum);
export const FundEquitySubCategorySchema = z.nativeEnum(MarketCapCategoryEnum);
export const FundDebtSubCategorySchema = z.nativeEnum(MarketCapCategoryEnum);
export const FundHybridSubCategorySchema = z.nativeEnum(MarketCapCategoryEnum);
export const FundCommoditiesSubCategorySchema = z.nativeEnum(
  MarketCapCategoryEnum,
);
export const FundRiskSchema = z.nativeEnum(FundRiskEnum);
export const FundRatingSchema = z.nativeEnum(FundRatingEnum);

export const FundHouseItemSchema = z.object({
  value: z.string(),
  label: z.string(),
  /** Generic short code for the item — for fund houses this is the AMC short name (e.g. "HDFCMF") */
  code: z.string().optional(),
  isActive: z.boolean(),
});

export const FundSubCategoryItemSchema = z.object({
  /** Enum value — one of the four sub-category enums */
  value: z.string(),
  label: z.string(),
  isActive: z.boolean(),
});

export const FundCategoryItemSchema = z.object({
  value: FundCategorySchema,
  label: z.string(),
  isActive: z.boolean(),
  subCategories: z.array(FundSubCategoryItemSchema),
});

export const FundSortByItemSchema = z.object({
  value: FundSortingFieldSchema,
  value2: SortDirectionSchema,
  label: z.string(),
  isActive: z.boolean(),
});

export const FundRiskItemSchema = z.object({
  value: FundRiskSchema,
  label: z.string(),
  isActive: z.boolean(),
});

export const FundRatingItemSchema = z.object({
  value: FundRatingSchema,
  label: z.string(),
  isActive: z.boolean(),
});

/** Wraps a filter options array with a UI-facing label and active flag for the filter group */
const makeFundFilterGroup = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    label: z.string(),
    isActive: z.boolean(),
    options: z.array(itemSchema),
  });

export const FundFilterMasterDataSchema = z.object({
  sortBy: makeFundFilterGroup(FundSortByItemSchema),
  categories: makeFundFilterGroup(FundCategoryItemSchema),
  risk: makeFundFilterGroup(FundRiskItemSchema),
  ratings: makeFundFilterGroup(FundRatingItemSchema),
  /** Fund houses — empty list in static master data, populated at runtime by the API */
  fundHouses: makeFundFilterGroup(FundHouseItemSchema),
});

// --- Inferred Types ---
export type FundEquitySubCategory = z.infer<typeof FundEquitySubCategorySchema>;
export type FundDebtSubCategory = z.infer<typeof FundDebtSubCategorySchema>;
export type FundHybridSubCategory = z.infer<typeof FundHybridSubCategorySchema>;
export type FundCommoditiesSubCategory = z.infer<
  typeof FundCommoditiesSubCategorySchema
>;
export type FundSortingField = z.infer<typeof FundSortingFieldSchema>;
export type SortDirection = z.infer<typeof SortDirectionSchema>;
export type FundRisk = z.infer<typeof FundRiskSchema>;
export type FundRating = z.infer<typeof FundRatingSchema>;
export type FundHouseItem = z.infer<typeof FundHouseItemSchema>;
export type FundSubCategoryItem = z.infer<typeof FundSubCategoryItemSchema>;
export type FundCategoryItem = z.infer<typeof FundCategoryItemSchema>;
export type FundSortByItem = z.infer<typeof FundSortByItemSchema>;
export type FundRiskItem = z.infer<typeof FundRiskItemSchema>;
export type FundRatingItem = z.infer<typeof FundRatingItemSchema>;
export type FundFilterMasterData = z.infer<typeof FundFilterMasterDataSchema>;
/** Generic type for a single filter group with active flag, UI label, and options array */
export type FundFilterGroup<T> = {
  isActive: boolean;
  label: string;
  options: T[];
};

// --- Constants ---

export const fundSortByOptions: readonly FundSortByItem[] = Object.freeze([
  {
    value: FundSortingFieldEnum.POPULARITY,
    value2: SortDirectionEnum.DESC,
    label: 'Popularity',
    isActive: false,
  },
  {
    value: FundSortingFieldEnum.RETURNS,
    value2: SortDirectionEnum.DESC,
    label: 'Returns: High to Low',
    isActive: true,
  },
  {
    value: FundSortingFieldEnum.RETURNS,
    value2: SortDirectionEnum.ASC,
    label: 'Returns: Low to High',
    isActive: true,
  },
  {
    value: FundSortingFieldEnum.RISK,
    value2: SortDirectionEnum.DESC,
    label: 'Risk: High to Low',
    isActive: true,
  },
  {
    value: FundSortingFieldEnum.RISK,
    value2: SortDirectionEnum.ASC,
    label: 'Risk: Low to High',
    isActive: true,
  },
  {
    value: FundSortingFieldEnum.NAME,
    value2: SortDirectionEnum.ASC,
    label: 'Name: A to Z',
    isActive: true,
  },
  {
    value: FundSortingFieldEnum.NAME,
    value2: SortDirectionEnum.DESC,
    label: 'Name: Z to A',
    isActive: true,
  },
]);

export const fundCategoryOptions: readonly FundCategoryItem[] = Object.freeze([
  {
    value: FundCategoryEnum.EQUITY,
    label: 'Equity',
    isActive: true,
    subCategories: [
      {
        value: MarketCapCategoryEnum.FLEXI_CAP,
        label: 'Flexi Cap',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.INTERNATIONAL,
        label: 'International',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.LARGE_MID_CAP,
        label: 'Large & MidCap',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.LARGE_CAP,
        label: 'Large Cap',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.MID_CAP,
        label: 'Mid Cap',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.MULTI_CAP,
        label: 'Multi Cap',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.SECTORAL,
        label: 'Sectoral',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.SMALL_CAP,
        label: 'Small Cap',
        isActive: true,
      },
      { value: MarketCapCategoryEnum.ELSS, label: 'ELSS', isActive: true },
      {
        value: MarketCapCategoryEnum.THEMATIC,
        label: 'Thematic',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.VALUE_ORIENTED,
        label: 'Value Oriented',
        isActive: true,
      },
    ],
  },
  {
    value: FundCategoryEnum.DEBT,
    label: 'Debt',
    isActive: true,
    subCategories: [
      {
        value: MarketCapCategoryEnum.BANKING_AND_PSU,
        label: 'Banking and PSU',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.CORPORATE_BOND,
        label: 'Corporate Bond',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.CREDIT_RISK,
        label: 'Credit Risk',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.DYNAMIC_BOND,
        label: 'Dynamic Bond',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.FIXED_MATURITY,
        label: 'Fixed Maturity',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.FLOATER,
        label: 'Floater',
        isActive: true,
      },
      { value: MarketCapCategoryEnum.GILT, label: 'Gilt', isActive: true },
      {
        value: MarketCapCategoryEnum.GILT_10_YEAR_CONSTANT,
        label: 'Gilt with 10 year Constant Duration',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.LIQUID,
        label: 'Liquid',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.LONG_DURATION,
        label: 'Long Duration',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.LOW_DURATION,
        label: 'Low Duration',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.MEDIUM_DURATION,
        label: 'Medium Duration',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.MEDIUM_TO_LONG_DURATION,
        label: 'Medium to Long Duration',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.MONEY_MARKET,
        label: 'Money Market',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.OVERNIGHT,
        label: 'Overnight',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.SHORT_DURATION,
        label: 'Short Duration',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.TARGET_MATURITY,
        label: 'Target Maturity',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.ULTRA_SHORT_DURATION,
        label: 'Ultra Short Duration',
        isActive: true,
      },
    ],
  },
  {
    value: FundCategoryEnum.HYBRID,
    label: 'Hybrid',
    isActive: true,
    subCategories: [
      {
        value: MarketCapCategoryEnum.HYBRID_AGGRESSIVE,
        label: 'Aggressive Hybrid',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.HYBRID_ARBITRAGE,
        label: 'Arbitrage',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.HYBRID_BALANCED,
        label: 'Balanced Hybrid',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.HYBRID_CONSERVATIVE,
        label: 'Conservative Hybrid',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.HYBRID_DYNAMIC_ASSET_ALLOCATION,
        label: 'Dynamic Asset Allocation',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.HYBRID_EQUITY_SAVINGS,
        label: 'Equity Savings',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.HYBRID_MULTI_ASSET_ALLOCATION,
        label: 'Multi Asset Allocation',
        isActive: true,
      },
    ],
  },
  {
    value: FundCategoryEnum.COMMODITIES,
    label: 'Commodities',
    isActive: true,
    subCategories: [
      {
        value: MarketCapCategoryEnum.GOLD,
        label: 'Gold',
        isActive: true,
      },
      {
        value: MarketCapCategoryEnum.SILVER,
        label: 'Silver',
        isActive: true,
      },
    ],
  },
]);

export const fundRiskOptions: readonly FundRiskItem[] = Object.freeze([
  { value: FundRiskEnum.LOW, label: 'Low', isActive: true },
  {
    value: FundRiskEnum.MODERATELY_LOW,
    label: 'Moderately Low',
    isActive: true,
  },
  { value: FundRiskEnum.MODERATE, label: 'Moderate', isActive: true },
  {
    value: FundRiskEnum.MODERATELY_HIGH,
    label: 'Moderately High',
    isActive: true,
  },
  { value: FundRiskEnum.HIGH, label: 'High', isActive: true },
  { value: FundRiskEnum.VERY_HIGH, label: 'Very High', isActive: true },
]);

export const fundRatingOptions: readonly FundRatingItem[] = Object.freeze([
  { value: FundRatingEnum.FIVE, label: '5', isActive: true },
  { value: FundRatingEnum.FOUR, label: '4', isActive: true },
  { value: FundRatingEnum.THREE, label: '3', isActive: true },
  { value: FundRatingEnum.TWO, label: '2', isActive: true },
  { value: FundRatingEnum.ONE, label: '1', isActive: true },
]);

/**
 * Static fund filter master data.
 * `fundHouses` is always empty here — populate it from the AMC/fund-house API at runtime.
 */
export const fundFilterMasterData: FundFilterMasterData = {
  sortBy: { label: 'Sort By', isActive: true, options: [...fundSortByOptions] },
  categories: {
    label: 'Categories',
    isActive: true,
    options: [...fundCategoryOptions],
  },
  risk: { label: 'Risk', isActive: true, options: [...fundRiskOptions] },
  ratings: {
    label: 'Ratings',
    isActive: true,
    options: [...fundRatingOptions],
  },
  fundHouses: { label: 'Fund House', isActive: true, options: [] },
};

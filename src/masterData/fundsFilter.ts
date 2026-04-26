/**
 * Fund filter master data: enums, schemas, types, and constants.
 * Used in the mutual fund explore/filter panel.
 * Fund houses are an empty list in static master data and populated at runtime by the API.
 */

import { z } from 'zod';

// --- Enums ---

export enum FundSortByEnum {
  POPULARITY = 'POPULARITY',
  RETURNS_HIGH_TO_LOW = 'RETURNS_HIGH_TO_LOW',
  RETURNS_LOW_TO_HIGH = 'RETURNS_LOW_TO_HIGH',
  RISK_HIGH_TO_LOW = 'RISK_HIGH_TO_LOW',
  RISK_LOW_TO_HIGH = 'RISK_LOW_TO_HIGH',
  NAME_A_TO_Z = 'NAME_A_TO_Z',
  NAME_Z_TO_A = 'NAME_Z_TO_A',
}

export enum FundCategoryEnum {
  EQUITY = 'EQUITY',
  DEBT = 'DEBT',
  HYBRID = 'HYBRID',
  COMMODITIES = 'COMMODITIES',
}

/** Sub-categories under Equity */
export enum FundEquitySubCategoryEnum {
  FLEXI_CAP = 'FLEXI_CAP',
  INTERNATIONAL = 'INTERNATIONAL',
  LARGE_AND_MIDCAP = 'LARGE_AND_MIDCAP',
  LARGE_CAP = 'LARGE_CAP',
  MID_CAP = 'MID_CAP',
  MULTI_CAP = 'MULTI_CAP',
  SECTORAL = 'SECTORAL',
  SMALL_CAP = 'SMALL_CAP',
  ELSS = 'ELSS',
  THEMATIC = 'THEMATIC',
  VALUE_ORIENTED = 'VALUE_ORIENTED',
}

/** Sub-categories under Debt */
export enum FundDebtSubCategoryEnum {
  BANKING_AND_PSU = 'BANKING_AND_PSU',
  CORPORATE_BOND = 'CORPORATE_BOND',
  CREDIT_RISK = 'CREDIT_RISK',
  DYNAMIC_BOND = 'DYNAMIC_BOND',
  FIXED_MATURITY = 'FIXED_MATURITY',
  FLOATER = 'FLOATER',
  GILT = 'GILT',
  GILT_10_YEAR_CONSTANT = 'GILT_10_YEAR_CONSTANT',
  LIQUID = 'LIQUID',
  LONG_DURATION = 'LONG_DURATION',
  LOW_DURATION = 'LOW_DURATION',
  MEDIUM_DURATION = 'MEDIUM_DURATION',
  MEDIUM_TO_LONG_DURATION = 'MEDIUM_TO_LONG_DURATION',
  MONEY_MARKET = 'MONEY_MARKET',
  OVERNIGHT = 'OVERNIGHT',
  SHORT_DURATION = 'SHORT_DURATION',
  TARGET_MATURITY = 'TARGET_MATURITY',
  ULTRA_SHORT_DURATION = 'ULTRA_SHORT_DURATION',
}

/** Sub-categories under Hybrid */
export enum FundHybridSubCategoryEnum {
  AGGRESSIVE_HYBRID = 'AGGRESSIVE_HYBRID',
  ARBITRAGE = 'ARBITRAGE',
  BALANCED_HYBRID = 'BALANCED_HYBRID',
  CONSERVATIVE_HYBRID = 'CONSERVATIVE_HYBRID',
  DYNAMIC_ASSET_ALLOCATION = 'DYNAMIC_ASSET_ALLOCATION',
  EQUITY_SAVINGS = 'EQUITY_SAVINGS',
  MULTI_ASSET_ALLOCATION = 'MULTI_ASSET_ALLOCATION',
}

/** Sub-categories under Commodities */
export enum FundCommoditiesSubCategoryEnum {
  GOLD = 'GOLD',
  SILVER = 'SILVER',
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

export const FundSortBySchema = z.nativeEnum(FundSortByEnum);
export const FundCategorySchema = z.nativeEnum(FundCategoryEnum);
export const FundEquitySubCategorySchema = z.nativeEnum(
  FundEquitySubCategoryEnum,
);
export const FundDebtSubCategorySchema = z.nativeEnum(FundDebtSubCategoryEnum);
export const FundHybridSubCategorySchema = z.nativeEnum(
  FundHybridSubCategoryEnum,
);
export const FundCommoditiesSubCategorySchema = z.nativeEnum(
  FundCommoditiesSubCategoryEnum,
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
  value: FundSortBySchema,
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
  { value: FundSortByEnum.POPULARITY, label: 'Popularity', isActive: false },
  {
    value: FundSortByEnum.RETURNS_HIGH_TO_LOW,
    label: 'Returns: High to Low',
    isActive: true,
  },
  {
    value: FundSortByEnum.RETURNS_LOW_TO_HIGH,
    label: 'Returns: Low to High',
    isActive: true,
  },
  {
    value: FundSortByEnum.RISK_HIGH_TO_LOW,
    label: 'Risk: High to Low',
    isActive: true,
  },
  {
    value: FundSortByEnum.RISK_LOW_TO_HIGH,
    label: 'Risk: Low to High',
    isActive: true,
  },
  { value: FundSortByEnum.NAME_A_TO_Z, label: 'Name: A to Z', isActive: true },
  { value: FundSortByEnum.NAME_Z_TO_A, label: 'Name: Z to A', isActive: true },
]);

export const fundCategoryOptions: readonly FundCategoryItem[] = Object.freeze([
  {
    value: FundCategoryEnum.EQUITY,
    label: 'Equity',
    isActive: true,
    subCategories: [
      {
        value: FundEquitySubCategoryEnum.FLEXI_CAP,
        label: 'Flexi Cap',
        isActive: true,
      },
      {
        value: FundEquitySubCategoryEnum.INTERNATIONAL,
        label: 'International',
        isActive: true,
      },
      {
        value: FundEquitySubCategoryEnum.LARGE_AND_MIDCAP,
        label: 'Large & MidCap',
        isActive: true,
      },
      {
        value: FundEquitySubCategoryEnum.LARGE_CAP,
        label: 'Large Cap',
        isActive: true,
      },
      {
        value: FundEquitySubCategoryEnum.MID_CAP,
        label: 'Mid Cap',
        isActive: true,
      },
      {
        value: FundEquitySubCategoryEnum.MULTI_CAP,
        label: 'Multi Cap',
        isActive: true,
      },
      {
        value: FundEquitySubCategoryEnum.SECTORAL,
        label: 'Sectoral',
        isActive: true,
      },
      {
        value: FundEquitySubCategoryEnum.SMALL_CAP,
        label: 'Small Cap',
        isActive: true,
      },
      { value: FundEquitySubCategoryEnum.ELSS, label: 'ELSS', isActive: true },
      {
        value: FundEquitySubCategoryEnum.THEMATIC,
        label: 'Thematic',
        isActive: true,
      },
      {
        value: FundEquitySubCategoryEnum.VALUE_ORIENTED,
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
        value: FundDebtSubCategoryEnum.BANKING_AND_PSU,
        label: 'Banking and PSU',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.CORPORATE_BOND,
        label: 'Corporate Bond',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.CREDIT_RISK,
        label: 'Credit Risk',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.DYNAMIC_BOND,
        label: 'Dynamic Bond',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.FIXED_MATURITY,
        label: 'Fixed Maturity',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.FLOATER,
        label: 'Floater',
        isActive: true,
      },
      { value: FundDebtSubCategoryEnum.GILT, label: 'Gilt', isActive: true },
      {
        value: FundDebtSubCategoryEnum.GILT_10_YEAR_CONSTANT,
        label: 'Gilt with 10 year Constant Duration',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.LIQUID,
        label: 'Liquid',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.LONG_DURATION,
        label: 'Long Duration',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.LOW_DURATION,
        label: 'Low Duration',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.MEDIUM_DURATION,
        label: 'Medium Duration',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.MEDIUM_TO_LONG_DURATION,
        label: 'Medium to Long Duration',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.MONEY_MARKET,
        label: 'Money Market',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.OVERNIGHT,
        label: 'Overnight',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.SHORT_DURATION,
        label: 'Short Duration',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.TARGET_MATURITY,
        label: 'Target Maturity',
        isActive: true,
      },
      {
        value: FundDebtSubCategoryEnum.ULTRA_SHORT_DURATION,
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
        value: FundHybridSubCategoryEnum.AGGRESSIVE_HYBRID,
        label: 'Aggressive Hybrid',
        isActive: true,
      },
      {
        value: FundHybridSubCategoryEnum.ARBITRAGE,
        label: 'Arbitrage',
        isActive: true,
      },
      {
        value: FundHybridSubCategoryEnum.BALANCED_HYBRID,
        label: 'Balanced Hybrid',
        isActive: true,
      },
      {
        value: FundHybridSubCategoryEnum.CONSERVATIVE_HYBRID,
        label: 'Conservative Hybrid',
        isActive: true,
      },
      {
        value: FundHybridSubCategoryEnum.DYNAMIC_ASSET_ALLOCATION,
        label: 'Dynamic Asset Allocation',
        isActive: true,
      },
      {
        value: FundHybridSubCategoryEnum.EQUITY_SAVINGS,
        label: 'Equity Savings',
        isActive: true,
      },
      {
        value: FundHybridSubCategoryEnum.MULTI_ASSET_ALLOCATION,
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
        value: FundCommoditiesSubCategoryEnum.GOLD,
        label: 'Gold',
        isActive: true,
      },
      {
        value: FundCommoditiesSubCategoryEnum.SILVER,
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

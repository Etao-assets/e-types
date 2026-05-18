/**
 * Fund risk colour classification types, enums, and schemas.
 * Sourced from ValueResearch colour_code table.
 */

import { z } from 'zod';

// --- Enums ---

export enum FundRiskColourEnum {
  BLUE             = 'BLUE',
  YELLOW           = 'YELLOW',
  BROWN            = 'BROWN',
  MODERATELY_LOW   = 'MODERATELY_LOW',
  LOW              = 'LOW',
  MODERATE         = 'MODERATE',
  LOW_TO_MODERATE  = 'LOW_TO_MODERATE',
  MODERATELY_HIGH  = 'MODERATELY_HIGH',
  HIGH             = 'HIGH',
  VERY_HIGH        = 'VERY_HIGH',
}

// --- Colour ID Mapping ---

/** Maps FundRiskColourEnum values to their numeric colour_id from the ValueResearch API */
export const FundRiskColourIdMap: Record<FundRiskColourEnum, number> = {
  [FundRiskColourEnum.BLUE]:            1,
  [FundRiskColourEnum.YELLOW]:          2,
  [FundRiskColourEnum.BROWN]:           3,
  [FundRiskColourEnum.LOW]:             4,
  [FundRiskColourEnum.MODERATELY_LOW]:  5,
  [FundRiskColourEnum.MODERATE]:        6,
  [FundRiskColourEnum.MODERATELY_HIGH]: 7,
  [FundRiskColourEnum.HIGH]:            8,
  [FundRiskColourEnum.VERY_HIGH]:       9,
  [FundRiskColourEnum.LOW_TO_MODERATE]: 10,
};

// --- Label Mapping ---

/** Maps FundRiskColourEnum values to their human-readable display label */
export const FundRiskColourLabelMap: Record<FundRiskColourEnum, string> = {
  [FundRiskColourEnum.BLUE]:            'Blue',
  [FundRiskColourEnum.YELLOW]:          'Yellow',
  [FundRiskColourEnum.BROWN]:           'Brown',
  [FundRiskColourEnum.MODERATELY_LOW]:  'Moderately Low',
  [FundRiskColourEnum.LOW]:             'Low',
  [FundRiskColourEnum.MODERATE]:        'Moderate',
  [FundRiskColourEnum.LOW_TO_MODERATE]: 'Low to Moderate',
  [FundRiskColourEnum.MODERATELY_HIGH]: 'Moderately High',
  [FundRiskColourEnum.HIGH]:            'High',
  [FundRiskColourEnum.VERY_HIGH]:       'Very High',
};

// --- Schemas ---
export const FundRiskColourSchema = z.nativeEnum(FundRiskColourEnum);

// --- Inferred Types ---
export type FundRiskColour = z.infer<typeof FundRiskColourSchema>;

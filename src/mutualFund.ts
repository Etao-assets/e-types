import { z } from 'zod';
import { amcSchema } from './amc';
import { MarketCapCategorySchema } from './marketCapCategory';
import { RiskProfileEnum } from './masterData';
import { DateObjOrString } from './date';
import { mfPerformanceSchema } from './mfPerformance';
import { mfPortfolioSchema } from './mfPortfolio';

export const fundManagerSchema = z.object({
  display: z.string(),
  managerId: z.string(),
  name: z.string(),
  role: z.string(),
  startDate: z.string(), // or z.coerce.date() if you want to parse as Date
  tenure: z.string(), // or z.number().transform(String) if you want to coerce to string
});

export const MutualFundSchemeSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  fundName: z.string(),
  fundId: z.string(),
  amcId: z.string(),
  amc: amcSchema.optional(),
  categoryIds: z.array(z.string()),
  categories: z.array(MarketCapCategorySchema).optional(),
  riskProfile: z.array(z.nativeEnum(RiskProfileEnum)),
  minSipAmount: z.number(),
  siSubsequentAmt: z.number(),
  isSipAvailable: z.boolean().default(true),
  expenseRatio: z.number(),
  fundManager: z.array(fundManagerSchema),
  minLumpsumAmount: z.number().nullable().optional(),
  minSubsequentMultiple: z.number(),
  maximumLumpsumAmount: z.number().nullable().optional(),
  inceptionDate: z.date().nullable().optional(),
  isActive: z.boolean(),
  createdAt: DateObjOrString,
  updatedAt: DateObjOrString,
  latestPerformanceId: z.string().nullable().optional(),
  latestPortfolioId: z.string().nullable().optional(),
  latestPerformance: mfPerformanceSchema.optional(),
  latestPortfolio: mfPortfolioSchema.optional(),
});

export const NewMutualFundSchema = MutualFundSchemeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const UpdateMutualFundSchema = MutualFundSchemeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type MutualFund = z.infer<typeof MutualFundSchemeSchema>;
export type NewMutualFund = z.infer<typeof NewMutualFundSchema>;
export type UpdateMutualFund = z.infer<typeof UpdateMutualFundSchema>;

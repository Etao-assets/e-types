import { z } from 'zod';

export enum EstimatedReturnsTypeEnum {
  SIP = 'sip',
  LUMPSUM = 'lumpsum',
  ALL = 'all',
}

export type EstimatedReturnsType = z.infer<typeof EstimatedReturnsTypeSchema>;

export const EstimatedReturnsTypeSchema = z.nativeEnum(
  EstimatedReturnsTypeEnum,
);

export const EstimatedReturnsResponseSchema = z.array(
  z.object({
    type: EstimatedReturnsTypeSchema,
    investedAmt: z.number(),
    estReturns: z.number(),
    totalValue: z.number(),
    rate: z.number(),
    tenureMonths: z.number(),
  }),
);

export type EstimatedReturnsResponse = z.infer<
  typeof EstimatedReturnsResponseSchema
>;

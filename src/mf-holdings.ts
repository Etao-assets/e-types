import { z } from 'zod';
import { DateObjOrString } from './date';

// ── Base schema (mirrors the mf_scheme_holdings DB table) ─────────────────────
export const mfSchemeHoldingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  schemeCode: z.string(),
  orderId: z.string().nullable().optional(),
  sipId: z.string().nullable().optional(),
  planId: z.string(),
  holdingType: z.string(), // 'SIP' | 'LUMPSUM' | 'SIP_AND_LUMPSUM'
  netUnits: z.number(),
  averageCostNav: z.number(),
  investedAmount: z.number(),
  currentValue: z.number(),
  totalReturnValue: z.number(),
  totalReturnPercentage: z.number(),
  day1ReturnValue: z.number(),
  day1ReturnPercentage: z.number(),
  xirr: z.number().nullable().optional(),
  lastComputedAt: DateObjOrString,
  createdAt: DateObjOrString,
  updatedAt: DateObjOrString,
});

// ── List item schema — shape returned by MfHoldingsService.getSchemeHoldings ──
export const mfSchemeHoldingListItemSchema = mfSchemeHoldingSchema.extend({
  sip: z
    .object({
      bseSxpRegNum: z.string().nullable().optional(),
      sipStatus: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  order: z
    .object({
      bseOrderId: z.string().nullable().optional(),
      orderStatus: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  fund: z
    .object({
      scheme_name: z.string(),
    })
    .nullable()
    .optional(),
});

// ── TypeScript types ──────────────────────────────────────────────────────────
export type MfSchemeHolding = z.infer<typeof mfSchemeHoldingSchema>;
export type MfSchemeHoldingListItem = z.infer<typeof mfSchemeHoldingListItemSchema>;

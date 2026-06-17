/**
 * Fixerra GET /api/v3/consolidate-view — consolidated FD/RD holdings view.
 *
 * Returns a summary of a user's holdings split into four buckets:
 *   active_holdings             — live, currently accruing FDs
 *   mature_holdings             — FDs that have reached maturity
 *   premature_withdrawal_holdings — FDs withdrawn before maturity
 *   in_progress_holdings        — FDs with booking in progress (not yet active)
 *
 * When the user has no holdings the response returns `success: 0` and `payload: ""`.
 */

import { z } from 'zod';
import { FixerraProductTypeEnum } from './fixerraEvent.schema';

// --- Enums ---

/** Issuer (bank/NBFC) codes accepted as a query-param filter on the API. */
export enum FixerraFCodeEnum {
  BAJ  = 'BAJ',
  MAH  = 'MAH',
  SHRI = 'SHRI',
  PNB  = 'PNB',
  USFB = 'USFB',
  SSFB = 'SSFB',
}

// --- Schemas ---

export const FixerraFCodeSchema = z.nativeEnum(FixerraFCodeEnum);

/**
 * Per-issuer aggregate inside a holdings bucket.
 * Keyed by the issuer's short code (e.g. "SSFB", "SHRI").
 */
export const FixerraIssuerDataSchema = z.object({
  fd_count:                 z.number(),
  total_interest_amount:    z.number(),
  total_investment_amount:  z.number(),
});

/** One element of the issuers array — a record with a single issuer-code key. */
export const FixerraIssuerEntrySchema = z.record(z.string(), FixerraIssuerDataSchema);

/** A single holdings bucket (active, mature, premature_withdrawal, in_progress). */
export const FixerraHoldingsBucketSchema = z.object({
  total_investment_amount: z.number(),
  total_interest_amount:   z.number(),
  total_fd:                z.number(),
  issuers:                 z.array(FixerraIssuerEntrySchema),
});

/** The `payload` object present when `success === 1`. */
export const FixerraConsolidateViewPayloadSchema = z.object({
  active_holdings:                 FixerraHoldingsBucketSchema.optional(),
  mature_holdings:                 FixerraHoldingsBucketSchema.optional(),
  premature_withdrawal_holdings:   FixerraHoldingsBucketSchema.optional(),
  in_progress_holdings:            FixerraHoldingsBucketSchema.optional(),
  current_gains_till_date:         z.number(),
  current_gains_till_previous_day: z.number(),
});

/** Full API response. `payload` is an empty string when `success === 0`. */
export const FixerraConsolidateViewResponseSchema = z.object({
  success:    z.union([z.literal(0), z.literal(1)]),
  statusCode: z.number(),
  message:    z.string(),
  payload:    z.union([z.literal(''), FixerraConsolidateViewPayloadSchema]),
});

/** Query parameters for GET /api/v3/consolidate-view. */
export const FixerraConsolidateViewParamsSchema = z.object({
  /** Filter by issuer code. Omit to return all issuers. */
  f_code:       z.nativeEnum(FixerraFCodeEnum).optional(),
  /** Filter by product type. Omit to return both FD and RD. */
  product_type: z.nativeEnum(FixerraProductTypeEnum).optional(),
});

// --- Inferred Types ---

export type FixerraFCode                     = z.infer<typeof FixerraFCodeSchema>;
export type FixerraIssuerData                = z.infer<typeof FixerraIssuerDataSchema>;
export type FixerraIssuerEntry               = z.infer<typeof FixerraIssuerEntrySchema>;
export type FixerraHoldingsBucket            = z.infer<typeof FixerraHoldingsBucketSchema>;
export type FixerraConsolidateViewPayload    = z.infer<typeof FixerraConsolidateViewPayloadSchema>;
export type FixerraConsolidateViewResponse   = z.infer<typeof FixerraConsolidateViewResponseSchema>;
export type FixerraConsolidateViewParams     = z.infer<typeof FixerraConsolidateViewParamsSchema>;

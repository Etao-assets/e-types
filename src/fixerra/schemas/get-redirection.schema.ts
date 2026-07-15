/**
 * Fixerra redirection URL retrieval — request and response schemas
 */

import { z } from 'zod';
import { FixerraPageEnum } from '../fixerraPage';

// ── Partner URL query parameter shapes ───────────────────────────────────────

/**
 * All supported query parameters for the partner redirect URL.
 * Only `authCode` is always required; the rest are optional depending on the use case.
 */
export const fixerraRedirectParamsSchema = z.object({
  authCode: z.string().min(1),
  /** Detailed investment redirection */
  issuer: z.string().optional(),
  tenure: z.union([z.string(), z.number()]).optional(),
  amount: z.union([z.string(), z.number()]).optional(),
  payout: z.string().optional(),
  /** Maps to `is_senior` query param */
  senior: z.union([z.boolean(), z.string()]).optional(),
  /** Maps to `is_tax_saver` query param */
  tax: z.union([z.boolean(), z.string()]).optional(),
  /** Maps to `is_women` query param */
  women: z.union([z.boolean(), z.string()]).optional(),
  /** Maps to `renewal_option` query param */
  renewal: z.string().optional(),
  /** Generic redirection */
  redirect: z.nativeEnum(FixerraPageEnum).optional(),
  /** Campaign / agent-code redirection */
  campaign: z.string().optional(),
  agent_code: z.string().optional(),
  /** Set to 1 to launch a Recurring Deposit (RD) journey instead of FD */
  RD: z.union([z.literal(1), z.literal('1'), z.boolean()]).optional(),
});

export type FixerraRedirectParams = z.infer<typeof fixerraRedirectParamsSchema>;

// ── Our API → Fixerra Request (query params) ──────────────────────────────────

export const fixerraGetRedirectionRequestSchema = z.object({
  /** Encrypted auth code used as the `authCode` query parameter */
  authCode: z.string().min(1),
});

export type FixerraGetRedirectionRequest = z.infer<
  typeof fixerraGetRedirectionRequestSchema
>;

// ── Fixerra → Our API Response ────────────────────────────────────────────────

export const fixerraGetRedirectionResponseSchema = z.object({
  /** Deep-link or web URL to redirect the user into the Fixerra app */
  link: z.string().url(),
});

export type FixerraGetRedirectionResponse = z.infer<
  typeof fixerraGetRedirectionResponseSchema
>;

// ── Our API → Client Response ─────────────────────────────────────────────────

export const getRedirectionApiResponseSchema = z.object({
  link: z.string().url(),
});

export type GetRedirectionApiResponse = z.infer<
  typeof getRedirectionApiResponseSchema
>;

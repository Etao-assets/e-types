/**
 * Fixerra API error response schemas.
 *
 * Fixerra returns two distinct error shapes:
 *
 *  1. Validation errors — `error` is an array of field-level error objects.
 *  2. Auth / generic errors — `error` is a single object with a message.
 *
 * `FixerraErrorResponseSchema` accepts both via a discriminated union on `error`.
 */

import { z } from 'zod';

// ── Validation error item (array variant) ─────────────────────────────────────

export const FixerraFieldErrorSchema = z.object({
  /** Fixerra internal error reason code */
  f_error_reason: z.string().optional(),
  /** Fixerra human-readable error message */
  f_error_message: z.string().optional(),
  /** Fixerra error code string (e.g. "FIXUSER1003") */
  errorCode: z.string().optional(),
  /** Short error description */
  error: z.string().optional(),
});

export type FixerraFieldError = z.infer<typeof FixerraFieldErrorSchema>;

// ── Auth / generic error object (object variant) ──────────────────────────────

export const FixerraGenericErrorSchema = z.object({
  statusCode: z.number().optional(),
  message: z.string().optional(),
  /** Error category label (e.g. "Unauthorized") */
  error: z.string().optional(),
});

export type FixerraGenericError = z.infer<typeof FixerraGenericErrorSchema>;

// ── Combined error response ────────────────────────────────────────────────────

export const FixerraErrorResponseSchema = z.object({
  /** 0 = failure */
  success: z.literal(0),
  statusCode: z.number(),
  message: z.string(),
  payload: z.record(z.unknown()).optional(),
  /** Array of field-level errors OR a single generic error object */
  error: z.union([
    z.array(FixerraFieldErrorSchema),
    FixerraGenericErrorSchema,
  ]),
});

export type FixerraErrorResponse = z.infer<typeof FixerraErrorResponseSchema>;

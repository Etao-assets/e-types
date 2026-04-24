/**
 * Standard sentinel values for "Not Available" and "Not Applicable",
 * each in both long-form (human-readable) and short-form (compact/code) variants.
 */

import { z } from 'zod';

// --- Enums ---

/** Long-form: full English phrases */
export enum NotAvailableLongEnum {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

/** Short-form: compact code */
export enum NotAvailableShortEnum {
  NA = 'NA',
}

/** Long-form: full English phrases */
export enum NotApplicableLongEnum {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

/** Short-form: compact code */
export enum NotApplicableShortEnum {
  NA = 'N/A',
}

// --- Schemas ---

export const NotAvailableLongSchema = z.nativeEnum(NotAvailableLongEnum);
export const NotAvailableShortSchema = z.nativeEnum(NotAvailableShortEnum);
export const NotApplicableLongSchema = z.nativeEnum(NotApplicableLongEnum);
export const NotApplicableShortSchema = z.nativeEnum(NotApplicableShortEnum);

// --- Inferred Types ---

export type NotAvailableLong = z.infer<typeof NotAvailableLongSchema>;
export type NotAvailableShort = z.infer<typeof NotAvailableShortSchema>;
export type NotApplicableLong = z.infer<typeof NotApplicableLongSchema>;
export type NotApplicableShort = z.infer<typeof NotApplicableShortSchema>;

/**
 * Company information types and validation schemas
 * Used by the public /api/company-info endpoint for trust/verification display in UI
 */

import { z } from 'zod';

// --- Schemas ---

export const CompanyInfoItemSchema = z.object({
  label: z.string().optional(),
  value: z.string().optional(),
});

export const CompanyInfoSchema = z.object({
  title: z.string(),
  items: z.array(CompanyInfoItemSchema),
});

export const CompanyInfoResponseSchema = z.object({
  success: z.boolean(),
  data: CompanyInfoSchema,
});

// --- Inferred Types ---

export type CompanyInfoItem = z.infer<typeof CompanyInfoItemSchema>;
export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;
export type CompanyInfoResponse = z.infer<typeof CompanyInfoResponseSchema>;

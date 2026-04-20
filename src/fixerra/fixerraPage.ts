/**
 * Fixerra app page identifiers and navigation schemas
 */

import { z } from 'zod';

// --- Enums ---

export enum FixerraPageEnum {
  PORTFOLIO = 'portfolio',
  HOME = 'home',
  EXPLORE = 'explore',
  BEST_RATES = 'best_rates',
  WOMEN_BENEFITS = 'women_benefits',
  TAX_SAVER = 'tax_saver',
  ISSUER_FDS = 'issuer_fds',
  FD_DETAIL = 'fd_detail',
  FD_SELECT = 'fd_select',
  FD_AMOUNT = 'fd_amount',
  FD_TENURE = 'fd_tenure',
  FD_PAY = 'fd_pay',
  FD_STATUS = 'fd_status',
  PROFILE = 'profile',
  PORTFOLIO_FD = 'portfolio_fd',
}

// --- Schemas ---

export const FixerraPageSchema = z.nativeEnum(FixerraPageEnum);

// --- Inferred Types ---

export type FixerraPage = z.infer<typeof FixerraPageSchema>;

/**
 * Fixerra registration status enum — mirrors the Prisma FixerraRegistrationStatus enum
 */

import { z } from 'zod';

// --- Enums ---

export enum FixerraRegistrationStatusEnum {
  PENDING = 'PENDING',
  REGISTERED = 'REGISTERED',
  FAILED = 'FAILED',
}

// --- Schemas ---

export const FixerraRegistrationStatusSchema = z.nativeEnum(
  FixerraRegistrationStatusEnum,
);

// --- Inferred Types ---

export type FixerraRegistrationStatus = z.infer<
  typeof FixerraRegistrationStatusSchema
>;

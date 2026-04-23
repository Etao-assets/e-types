/**
 * Fixerra webhook event — payload that Fixerra POSTs to our endpoint
 * during the FD journey (user progress, booking, payment, status updates).
 */

import { z } from 'zod';

// --- Enums ---

export enum FixerraWebhookEventTypeEnum {
  /** User started the FD journey */
  USER_PROGRESS = 'USER_PROGRESS',
  /** FD booking was created / updated */
  BOOKING_STATUS = 'BOOKING_STATUS',
  /** Payment status changed */
  PAYMENT_STATUS = 'PAYMENT_STATUS',
  /** KYC status updated */
  KYC_STATUS = 'KYC_STATUS',
  /** FD matured or premature withdrawal initiated */
  FD_MATURITY = 'FD_MATURITY',
  /** Generic status update not covered by a specific type */
  STATUS_UPDATE = 'STATUS_UPDATE',
}

export enum FixerraWebhookStatusEnum {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  CANCELLED = 'CANCELLED',
}

// --- Schemas ---

export const FixerraWebhookEventTypeSchema = z.nativeEnum(
  FixerraWebhookEventTypeEnum,
);

export const FixerraWebhookStatusSchema = z.nativeEnum(
  FixerraWebhookStatusEnum,
);

/**
 * Core webhook payload schema.
 * Fixerra may include additional partner-specific fields inside `data` —
 * we use `z.record` with `z.unknown()` for forward-compatible parsing.
 */
export const FixerraWebhookPayloadSchema = z.object({
  /** Unique identifier for this webhook event */
  eventId: z.string().min(1),
  /** Event type discriminant */
  eventType: FixerraWebhookEventTypeSchema,
  /** Overall status for this event */
  status: FixerraWebhookStatusSchema,
  /** ISO 8601 timestamp when the event occurred on Fixerra's side */
  eventTime: z.string().min(1),
  /** Partner code — must match our registered FIXERRA_PARTNER_CODE */
  partnerCode: z.string().min(1),
  /** Fixerra internal user / customer identifier */
  customerId: z.string().optional(),
  /** FD booking / application reference */
  bookingId: z.string().optional(),
  /** Payment reference */
  paymentId: z.string().optional(),
  /** Event-specific payload; schema is open-ended by design */
  data: z.record(z.unknown()).optional(),
  /** Human-readable message from Fixerra */
  message: z.string().optional(),
});

export const FixerraWebhookResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  eventId: z.string(),
});

// --- Inferred Types ---

export type FixerraWebhookEventType = z.infer<
  typeof FixerraWebhookEventTypeSchema
>;
export type FixerraWebhookStatus = z.infer<typeof FixerraWebhookStatusSchema>;
export type FixerraWebhookPayload = z.infer<typeof FixerraWebhookPayloadSchema>;
export type FixerraWebhookResponse = z.infer<
  typeof FixerraWebhookResponseSchema
>;

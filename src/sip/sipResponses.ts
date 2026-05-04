/**
 * SIP service response types for sipRegisterDraft, confirmDraftSip, and updateDraftSip.
 */

import { z } from 'zod';
import { SxPFrequency, SxPType } from '../bse/enums/v2Enums';
import { SxpWebhookEvent } from '../bse/enums/WebhookEvent';
import { DateObjOrString } from '../date';

// ─── Shared base schema (mirrors the Prisma SIP model shape) ─────────────────

/**
 * Core SIP record fields returned from Prisma after create or update.
 * amount is Decimal(15,2) when returned from Prisma; use DecimalOrNumber to
 * accept both Prisma Decimal and plain number values.
 */
export const SipRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  memSxpRegNum: z.string(),
  memberCode: z.string(),
  clientCode: z.string(),
  sxpType: z.nativeEnum(SxPType).or(z.string()),
  planId: z.string(),
  schemeCode: z.string(),
  amount: z.number(), // Decimal(15,2) — do not log raw value
  frequency: z.nativeEnum(SxPFrequency).or(z.string()),
  startDate: DateObjOrString,
  validTill: DateObjOrString,
  regDate: DateObjOrString,
  nInstallments: z.number().int().nullable(),
  executedInstallments: z.number().int(),
  lastExecutedAt: DateObjOrString.nullable(),
  pausedFrom: DateObjOrString.nullable(),
  bseSxpRegNum: z.string().nullable(),
  sipStatus: z.nativeEnum(SxpWebhookEvent).or(z.string()),
  apiStatus: z.string(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  currentState: z.string().nullable(),
  stateHistory: z.unknown().nullable(),
  lastWebhookAt: DateObjOrString.nullable(),
  webhookEventId: z.string().nullable(),
  consecutiveFailures: z.number().int(),
  lastInstallmentOrderId: z.string().nullable(),
  childOrderEvents: z.unknown().nullable(),
  uccRegistrationId: z.string(),
  mandateId: z.string().nullable(),
  investmentGoalId: z.string().nullable(),
});

export type SipRecord = z.infer<typeof SipRecordSchema>;

// ─── sipRegisterDraft response ────────────────────────────────────────────────

export const SipRegisterDraftResponseSchema = SipRecordSchema.extend({
  /** Computed first SIP installment date (after FOT gap calculation) */
  firstSipDate: DateObjOrString,
});

export type SipRegisterDraftResponse = z.infer<
  typeof SipRegisterDraftResponseSchema
>;

// ─── confirmDraftSip response ─────────────────────────────────────────────────

export const SipConfirmDraftResponseSchema = z.object({
  /** BSE-assigned SxP registration ID */
  sxpRegistrationId: z.string(),
  /** Internal SIP record ID */
  sipId: z.string(),
  /** SIP lifecycle status after confirmation */
  status: z.string(),
  /** Member SxP reference ID (our internal reference) */
  memSxpRefId: z.string(),
  /** BSE order ID for first-order-today (FOT); null when FOT was not created */
  orderId: z.string().nullable(),
});

export type SipConfirmDraftResponse = z.infer<
  typeof SipConfirmDraftResponseSchema
>;

// ─── updateDraftSip response ──────────────────────────────────────────────────

/** Return type for updateDraftSip — the full updated SIP record. */
export const SipUpdateDraftResponseSchema = SipRecordSchema;

export type SipUpdateDraftResponse = z.infer<
  typeof SipUpdateDraftResponseSchema
>;

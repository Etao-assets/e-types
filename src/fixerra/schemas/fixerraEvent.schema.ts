/**
 * Fixerra webhook event — state/sub_state/status enums and payload schemas
 * as defined in the Fixerra Partner Integration Reference (v1.0).
 *
 * Notes:
 *  - All object schemas use .passthrough() to allow unknown forward-compatible fields.
 *  - Boolean flags (taxSave, senCitizen, womenParam) may arrive as true/false OR "true"/"false".
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum FixerraStateEnum {
  PROFILE_CREATION  = 'PROFILE_CREATION',
  KYC_VERIFICATION  = 'KYC_VERIFICATION',
  BANK_ACC_DETAILS  = 'BANK_ACC_DETAILS',
  NOMINEE_DETAILS   = 'NOMINEE_DETAILS',
  FD_BOOKING        = 'FD_BOOKING',
  RD_BOOKING        = 'RD_BOOKING',
  DROP_OFF          = 'DROP_OFF',
  SA_BOOKING        = 'SA_BOOKING',
  EKYC_VERIFICATION = 'EKYC_VERIFICATION',
}

export enum FixerraSubStateEnum {
  REGISTER                               = 'REGISTER',
  PAN_VERIFICATION                       = 'PAN_VERIFICATION',
  EMAIL_VERIFICATION                     = 'EMAIL_VERIFICATION',
  EMAIL_VERIFICATION_AND_PERSONAL_DETAILS = 'EMAIL_VERIFICATION_AND_PERSONAL_DETAILS',
  AADHAR_VERIFICATION                    = 'AADHAR_VERIFICATION',
  AADHAAR_NAME_MATCH                     = 'AADHAAR_NAME_MATCH',
  EKYC_VERIFICATION                      = 'EKYC_VERIFICATION',
  CKYC_VERIFICATION                      = 'CKYC_VERIFICATION',
  VKYC_VERIFICATION                      = 'VKYC_VERIFICATION',
  IIB_EMAIL_VERIFICATION                 = 'IIB_EMAIL_VERIFICATION',
  IIB_MOBILE_VERIFICATION                = 'IIB_MOBILE_VERIFICATION',
  ASSISTED_JOURNEY_KYC                   = 'ASSISTED_JOURNEY_KYC',
  BANK_ACC_DETAILS                       = 'BANK_ACC_DETAILS',
  BANK_NAME_MATCH                        = 'BANK_NAME_MATCH',
  NOMINEE_DETAILS                        = 'NOMINEE_DETAILS',
  FD_DETAILS                             = 'FD_DETAILS',
  FD_BOOKING_INTENT                      = 'FD_BOOKING_INTENT',
  REVIEW_AND_PAY                         = 'REVIEW_AND_PAY',
  HOLDING_STATUS                         = 'HOLDING_STATUS',
  ASSISTED_JOURNEY_BOOKING               = 'ASSISTED_JOURNEY_BOOKING',
  RD_DETAILS                             = 'RD_DETAILS',
  RD_BOOKING_INTENT                      = 'RD_BOOKING_INTENT',
  INACTIVITY                             = 'INACTIVITY',
  SA_INITIATION                          = 'SA_INITIATION',
  SA_DATA_DETAILS                        = 'SA_DATA_DETAILS',
  VERIFY_ADDRESS                         = 'VERIFY_ADDRESS',

  //found during testing but not in doc
  LOGIN = 'LOGIN',
  FAILED = 'FAILED',
  DEDUPE_VERIFICATION = 'DEDUPE_VERIFICATION',
  PAYMENT_STATUS = 'PAYMENT_STATUS',
  CUSTOMER_CREATION = 'CUSTOMER_CREATION',

  // Additional sub-states observed in issuer-specific flows
  PAN_SSFB_VERIFICATION    = 'PAN_SSFB_VERIFICATION',
  USFB_PAN_VERIFICATION    = 'USFB_PAN_VERIFICATION',
  IIB_DEDUPE_VERIFICATION  = 'IIB_DEDUPE_VERIFICATION',
  IIB_PAN_VERIFICATION     = 'IIB_PAN_VERIFICATION',
  AADHAAR_MOBILE_VERIFICATION = 'AADHAAR_MOBILE_VERIFICATION',
  AML_VERIFICATION         = 'AML_VERIFICATION',
  PAN_AADHAAR_VERIFICATION = 'PAN_AADHAAR_VERIFICATION',
  NAME_MATCH_VERIFICATION  = 'NAME_MATCH_VERIFICATION',

  // FD lifecycle sub-states
  FD_MATURED           = 'FD_MATURED',
  PREMATURE_WITHDRAWAL = 'PREMATURE_WITHDRAWAL',

  // RD (Recurring Deposit) sub-states — observed in Suryoday RD webhook captures
  MANDATE_STATUS       = 'MANDATE_STATUS',       // Auto-debit mandate setup (state: RD_BOOKING)
  PINCODE_VERIFICATION = 'PINCODE_VERIFICATION', // RD KYC step (state: KYC_VERIFICATION)

  /**
   * Each monthly RD auto-debit AFTER the first (state: RD_BOOKING).
   * Installment #1 is reported by HOLDING_STATUS; #2 onwards by this event.
   * Carries `total_installments_completed` + `cummulative_amount`.
   * Absent from Fixerra's RD webhook doc — found in production traffic only.
   */
  INSTALLMENT_STATUS   = 'INSTALLMENT_STATUS',

  /**
   * Fixerra confirming a partner user was created (state: PROFILE_CREATION).
   * Informational: we create FixerraPartnerUser ourselves in registerUser,
   * roughly 0.3 s before this arrives. No state change on receipt.
   */
  USER_CREATED         = 'USER_CREATED',
}

export enum FixerraEventStatusEnum {
  PAGE_LOAD                    = 'PAGE_LOAD',
  INITIATED                    = 'INITIATED',
  SUCCESS                      = 'SUCCESS',
  CHECKOUT_INITIATED           = 'CHECKOUT_INITIATED',
  REGULAR_CHECKOUT_INITIATED   = 'REGULAR_CHECKOUT_INITIATED',
  PREFERRED_CHECKOUT_INITIATED = 'PREFERRED_CHECKOUT_INITIATED',
  RENEW_MODAL_INITIATED        = 'RENEW_MODAL_INITIATED',
  SA_PAGE_LOAD                 = 'SA_PAGE_LOAD',

  //found during testing but not in doc
  PENDING = 'PENDING',
  FAILED= 'FAILED',

  // VKYC verification statuses
  OPEN               = 'OPEN',
  AGENT_ASSIGNED     = 'AGENT_ASSIGNED',
  AGENT_SUCCESS      = 'AGENT_SUCCESS',
  AGENT_REJECTED     = 'AGENT_REJECTED',
  AUDITOR_APPROVAL   = 'AUDITOR_APPROVAL',
  AUDITOR_REJECTED   = 'AUDITOR_REJECTED',
  AUDITOR_READY      = 'AUDITOR_READY',
  AUDITOR_ASSIGNED   = 'AUDITOR_ASSIGNED',

  // Booking / payment statuses
  CONFIRMED                  = 'CONFIRMED',
  REFUNDED                   = 'REFUNDED',
  /**
   * Auto-debit mandate revoked (sub_state: MANDATE_STATUS). Means no further
   * installments will be collected — it does NOT mean money already deposited
   * has been returned. See FixerraWebhookService.handleMandateRevoked.
   */
  REVOKED                    = 'REVOKED',
  REFUND_INITIATED           = 'REFUND INITIATED',  // Fixerra sends a space-separated value
  RENEWED                    = 'RENEWED',
  WINBACK_MODAL_PAGE_LOAD    = 'WINBACK_MODAL_PAGE_LOAD',
  WINBACK_MODAL_INITIATED    = 'WINBACK_MODAL_INITIATED',
  WINBACK_MODAL_BACK_INITIATED = 'WINBACK_MODAL_BACK_INITIATED',
}

export enum FixerraProductTypeEnum {
  FD = 'FD',
  RD = 'RD',
  SA = 'SA',
}

export enum FixerraRenewalPreferenceEnum {
  PAY_AT_MAT        = 'PAY_AT_MAT',
  RENEW_PRI_AMT     = 'RENEW_PRI_AMT',
  RENEW_PRI_INT_AMT = 'RENEW_PRI_INT_AMT',
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/** Accepts native boolean or the string literals "true" / "false" */
export const FixerraBoolLikeSchema = z.union([
  z.boolean(),
  z.enum(['true', 'false']),
]);

/**
 * A documented enum member, while still accepting any future value Fixerra adds.
 *
 * Editors autocomplete the known members; the runtime accepts anything non-empty.
 * `(string & {})` is the standard trick that keeps literal suggestions alive
 * inside a union with `string`.
 */
type OpenEnum<E extends string> = E | (string & {});

/**
 * ⚠️ These are deliberately NOT `z.nativeEnum`.
 *
 * Between 2026-06-16 and 2026-09-16, `z.nativeEnum` rejected **137** live events
 * at the route — before any handler ran and before anything was persisted — because
 * Fixerra emits values that are absent from their own integration doc. Among them:
 * `INSTALLMENT_STATUS` (every monthly RD debit), `MANDATE_STATUS/REVOKED` (mandate
 * cancelled) and `USER_CREATED`. Two further values, `MANDATE_STATUS` and
 * `PINCODE_VERIFICATION`, were dropped 30 times before being patched in reactively.
 * Nothing but a CloudWatch error line survived any of it.
 *
 * Membership is therefore no longer a gate. The envelope is still validated —
 * these must be present and non-empty strings, and `data` must be the right shape —
 * so a genuinely malformed payload still fails loudly. What changed is that an
 * unfamiliar *value* now reaches the handlers, which route on explicit comparisons
 * and fall through to a logged no-op when they do not recognise it.
 *
 * Full analysis: docs/BUG-fixerra-webhook-drops-events.md
 */
export const FixerraStateSchema: z.ZodType<FixerraState> = z.string().min(1);
export const FixerraSubStateSchema: z.ZodType<FixerraSubState> = z.string().min(1);
export const FixerraEventStatusSchema: z.ZodType<FixerraEventStatus> = z.string().min(1);
export const FixerraProductTypeSchema: z.ZodType<FixerraProductType> = z.string().min(1);
export const FixerraRenewalPreferenceSchema: z.ZodType<FixerraRenewalPreference> =
  z.string().min(1);

/** d1 metadata block — carries the tracing event_id */
export const FixerraWebhookD1Schema = z
  .object({
    event_id: z.string(),
  })
  .passthrough();

/** Issuer details nested inside the data payload */
export const FixerraIssuerMetaSchema = z
  .object({
    f_issuer_id:  z.string().optional(),
    f_code:       z.string().optional(),
    issuer_type:  z.string().optional(),
    name:         z.string().optional(),
  })
  .passthrough();

/** Common business data object shared across journey stages */
export const FixerraWebhookEventDataSchema = z
  .object({
    f_partner_user_id:       z.string(),                                    // Partner-side user identifier for reconciliation
    event_id:                z.string().optional(),                          // Event identifier carried in the transformed business payload
    f_investment_vehicle_id: z.string().optional(),                          // Fixerra investment vehicle identifier
    f_user_transaction_id:   z.string().optional(),                          // Transaction identifier, typically available later in the journey

    // Issuer fields (flattened from the data.issuer object)
    f_issuer_id:             z.string().optional(),                          // data.issuer.f_issuer_id — Fixerra-assigned issuer identifier
    issuer_name:             z.string().optional(),                          // data.issuer.name — human-readable issuer name
    f_code:                  z.string().optional(),                          // data.issuer.f_code — short issuer code (e.g. "SSFB")
    issuer_type:             z.string().optional(),                          // data.issuer.issuer_type — category (e.g. "SMALL FINANCE BANK")

    product_interest:        z.union([z.string(), z.number()]).transform(Number).optional(), // Interest rate; Fixerra sends numeric 0 on early events, string later — accept both
    tenure:                  z.union([z.string(), z.number()]).transform(Number).optional(), // Selected tenure value
    product_payout_freq:     z.string().optional(),                          // Payout type indicator, e.g. "C" (cumulative) or "NC" (non-cumulative)
    product_interest_freq:   z.string().optional(),                          // Human-readable payout or interest frequency where applicable
    investment_amount:       z.union([z.string(), z.number()]).transform(Number).optional(), // Selected investment amount
    maturity_amount:         z.union([z.string(), z.number()]).transform(Number).optional(), // Expected maturity amount
    payout_amount:           z.union([z.string(), z.number()]).transform(Number).optional(), // Periodic payout amount for non-cumulative journeys when applicable
    total_gains:             z.union([z.string(), z.number()]).transform(Number).optional(), // Projected gains over the investment lifecycle when applicable
    maturity_dt:             z.string().optional(),                          // Maturity date in ISO format when available
    investment_dt:           z.string().optional(),                          // Investment date when available
    renewal_preference:      FixerraRenewalPreferenceSchema.optional(),      // Maturity instruction: PAY_AT_MAT | RENEW_PRI_AMT | RENEW_PRI_INT_AMT
    auto_renewal:            z.string().optional(),                          // "yes" or "no" based on selected maturity instruction

    // Boolean product flags — camelCase variants (legacy) and snake_case variants (new)
    taxSave:                 FixerraBoolLikeSchema.optional(),               // Tax-saver flag (legacy camelCase)
    product_tax_saver:       FixerraBoolLikeSchema.optional(),               // Tax-saver flag (snake_case)
    senCitizen:              FixerraBoolLikeSchema.optional(),               // Senior-citizen flag (legacy camelCase)
    product_senior_citizen:  FixerraBoolLikeSchema.optional(),               // Senior-citizen flag (snake_case)
    womenParam:              FixerraBoolLikeSchema.optional(),               // Women-benefit flag (legacy camelCase)
    product_women:           FixerraBoolLikeSchema.optional(),               // Women-benefit flag (snake_case)

    vkyc_required:           FixerraBoolLikeSchema.optional(),               // VKYC required flag; may arrive as boolean or string "true"/"false"
    payment_mode:            z.string().optional(),                          // Payment mode selected by the user, e.g. "NETBANKING", "UPI"
    product_type:            FixerraProductTypeSchema.optional(),            // Product category when applicable: FD | RD | SA

    // RD (Recurring Deposit) specific fields — present on RD journeys only
    installment_amount:           z.union([z.string(), z.number()]).transform(Number).optional(), // Monthly RD installment amount
    total_investment_amount:      z.union([z.string(), z.number()]).transform(Number).optional(), // Total committed over the RD tenure
    cummulative_amount:           z.union([z.string(), z.number()]).transform(Number).optional(), // ⚠️ Fixerra's spelling (double-m): amount deposited so far (HOLDING_STATUS)
    next_installment_date:        z.string().optional(),                                          // ISO date of the next auto-debit (HOLDING_STATUS)
    total_installments_completed: z.union([z.string(), z.number()]).transform(Number).optional(), // Count of completed RD installments (HOLDING_STATUS)
    f_user_nominee_id:            z.string().optional(),                                          // Nominee record identifier (present from payment onward)
    is_ntb:                       FixerraBoolLikeSchema.optional(),                               // New-to-Bank flag (present on some KYC events)
  })
  // Keeps fields Fixerra sends that we do not model yet (e.g. `marketing_campaign`
  // on PROFILE_CREATION/USER_CREATED) so they reach the logs instead of being
  // silently stripped. Matches the forward-compatibility note at the top of this file.
  .passthrough();

/** Top-level Fixerra webhook event payload */
export const FixerraWebhookEventSchema = z
  .object({
    state:        FixerraStateSchema,                      // High-level journey category (e.g. KYC_VERIFICATION, FD_BOOKING)
    sub_state:    FixerraSubStateSchema,                   // Specific milestone within the journey (e.g. REVIEW_AND_PAY)
    status:       FixerraEventStatusSchema.optional(),                // Event context: PAGE_LOAD | INITIATED | SUCCESS | etc.
    product_type: FixerraProductTypeSchema.optional(),     // Product category when applicable: FD | RD | SA
    d1:           FixerraWebhookD1Schema.optional(),                  // Metadata block carrying the tracing event_id for deduplication
    d2:           z.record(z.unknown()).optional(),        // Optional supplementary metadata, typically used for error details
    data:         FixerraWebhookEventDataSchema,           // Journey-specific business payload
  })
  .passthrough();

// ---------------------------------------------------------------------------
// Inferred Types
// ---------------------------------------------------------------------------

// Declared as open unions rather than `z.infer<typeof …Schema>`: the schemas are
// now typed in terms of these, so inferring back from them would be circular.
// Known members autocomplete; any future Fixerra value is still accepted.
export type FixerraState              = OpenEnum<`${FixerraStateEnum}`>;
export type FixerraSubState           = OpenEnum<`${FixerraSubStateEnum}`>;
export type FixerraEventStatus        = OpenEnum<`${FixerraEventStatusEnum}`>;
export type FixerraProductType        = OpenEnum<`${FixerraProductTypeEnum}`>;
export type FixerraRenewalPreference  = OpenEnum<`${FixerraRenewalPreferenceEnum}`>;
export type FixerraBoolLike           = z.infer<typeof FixerraBoolLikeSchema>;
export type FixerraWebhookD1          = z.infer<typeof FixerraWebhookD1Schema>;
export type FixerraIssuerMeta         = z.infer<typeof FixerraIssuerMetaSchema>;
export type FixerraWebhookEventData   = z.infer<typeof FixerraWebhookEventDataSchema>;
export type FixerraWebhookEvent       = z.infer<typeof FixerraWebhookEventSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maps each Fixerra journey state to its valid sub-states */
export const FixerraStateSubStateMap = {
  [FixerraStateEnum.PROFILE_CREATION]: [
    FixerraSubStateEnum.REGISTER,
    FixerraSubStateEnum.LOGIN
  ],
  [FixerraStateEnum.KYC_VERIFICATION]: [
    FixerraSubStateEnum.PAN_VERIFICATION,
    FixerraSubStateEnum.EMAIL_VERIFICATION,
    FixerraSubStateEnum.EMAIL_VERIFICATION_AND_PERSONAL_DETAILS,
    FixerraSubStateEnum.AADHAR_VERIFICATION,
    FixerraSubStateEnum.AADHAAR_NAME_MATCH,
    FixerraSubStateEnum.EKYC_VERIFICATION,
    FixerraSubStateEnum.CKYC_VERIFICATION,
    FixerraSubStateEnum.VKYC_VERIFICATION,
    FixerraSubStateEnum.IIB_EMAIL_VERIFICATION,
    FixerraSubStateEnum.IIB_MOBILE_VERIFICATION,
    FixerraSubStateEnum.ASSISTED_JOURNEY_KYC,
    FixerraSubStateEnum.DEDUPE_VERIFICATION,
    FixerraSubStateEnum.CUSTOMER_CREATION,
    FixerraSubStateEnum.PAN_SSFB_VERIFICATION,
    FixerraSubStateEnum.USFB_PAN_VERIFICATION,
    FixerraSubStateEnum.IIB_DEDUPE_VERIFICATION,
    FixerraSubStateEnum.IIB_PAN_VERIFICATION,
    FixerraSubStateEnum.AADHAAR_MOBILE_VERIFICATION,
    FixerraSubStateEnum.AML_VERIFICATION,
    FixerraSubStateEnum.PAN_AADHAAR_VERIFICATION,
    FixerraSubStateEnum.NAME_MATCH_VERIFICATION,
    FixerraSubStateEnum.PINCODE_VERIFICATION,
  ],
  [FixerraStateEnum.BANK_ACC_DETAILS]: [
    FixerraSubStateEnum.BANK_ACC_DETAILS,
    FixerraSubStateEnum.BANK_NAME_MATCH,
  ],
  [FixerraStateEnum.NOMINEE_DETAILS]: [
    FixerraSubStateEnum.NOMINEE_DETAILS,
  ],
  [FixerraStateEnum.FD_BOOKING]: [
    FixerraSubStateEnum.FD_DETAILS,
    FixerraSubStateEnum.FD_BOOKING_INTENT,
    FixerraSubStateEnum.REVIEW_AND_PAY,
    FixerraSubStateEnum.HOLDING_STATUS,
    FixerraSubStateEnum.ASSISTED_JOURNEY_BOOKING,
    FixerraSubStateEnum.PAYMENT_STATUS,
    FixerraSubStateEnum.FD_MATURED,
    FixerraSubStateEnum.PREMATURE_WITHDRAWAL,
  ],
  [FixerraStateEnum.RD_BOOKING]: [
    FixerraSubStateEnum.RD_DETAILS,
    FixerraSubStateEnum.RD_BOOKING_INTENT,
    FixerraSubStateEnum.REVIEW_AND_PAY,
    FixerraSubStateEnum.MANDATE_STATUS,
    FixerraSubStateEnum.PAYMENT_STATUS,
    FixerraSubStateEnum.HOLDING_STATUS,
    FixerraSubStateEnum.ASSISTED_JOURNEY_BOOKING,
  ],
  [FixerraStateEnum.DROP_OFF]: [
    FixerraSubStateEnum.INACTIVITY,
  ],
  [FixerraStateEnum.SA_BOOKING]: [
    FixerraSubStateEnum.SA_INITIATION,
    FixerraSubStateEnum.SA_DATA_DETAILS,
  ],
  [FixerraStateEnum.EKYC_VERIFICATION]: [
    FixerraSubStateEnum.VERIFY_ADDRESS,
  ],
} as const;

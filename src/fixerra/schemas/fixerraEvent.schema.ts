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

export const FixerraStateSchema         = z.nativeEnum(FixerraStateEnum);
export const FixerraSubStateSchema      = z.nativeEnum(FixerraSubStateEnum);
export const FixerraEventStatusSchema   = z.nativeEnum(FixerraEventStatusEnum);
export const FixerraProductTypeSchema   = z.nativeEnum(FixerraProductTypeEnum);
export const FixerraRenewalPreferenceSchema = z.nativeEnum(FixerraRenewalPreferenceEnum);

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

    product_interest:        z.string().optional(),                          // Interest rate for the selected product
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
  });

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

// ---------------------------------------------------------------------------
// Inferred Types
// ---------------------------------------------------------------------------

export type FixerraState              = z.infer<typeof FixerraStateSchema>;
export type FixerraSubState           = z.infer<typeof FixerraSubStateSchema>;
export type FixerraEventStatus        = z.infer<typeof FixerraEventStatusSchema>;
export type FixerraProductType        = z.infer<typeof FixerraProductTypeSchema>;
export type FixerraRenewalPreference  = z.infer<typeof FixerraRenewalPreferenceSchema>;
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
  ],
  [FixerraStateEnum.RD_BOOKING]: [
    FixerraSubStateEnum.RD_DETAILS,
    FixerraSubStateEnum.RD_BOOKING_INTENT,
    FixerraSubStateEnum.REVIEW_AND_PAY,
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

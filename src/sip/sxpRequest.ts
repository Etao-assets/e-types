/**
 * BSE SxP (SIP/SWP/STP) Registration Request Schema
 * 
 * Example SIP Request:
 * {
 *   "data": {
 *     "sxp_type": "sip",
 *     "mem_sxp_ref_id": "DUMMY-SXP-001",
 *     "investor": { "ucc": "DUMMYUCC0001" },
 *     "member": "00000",
 *     "src_scheme": "DUMMY-SCHEME-GR",
 *     "amount": 1000,
 *     "cur": "INR",
 *     "is_fresh": true,
 *     "phys_or_demat": "d",
 *     "start_date": "2025-10-09",
 *     "freq": "m",
 *     "is_nomination_opted": false,
 *     "holder": [{ "holder_rank": "1", "email": "test@example.com", "mobnum": "+919000000001" }]
 *   }
 * }
 */

import { z } from 'zod';
import {
  SxPType,
  SxPFrequency,
  PhysicalOrDemat,
  Currency,
  YesNo,
  HolderRank,
  NominationAuthMode,
  BankAccountType,
  DepositoryCode,
} from '../bse/enums/v2Enums';
import { bseSuccessResponseSchema } from '../bse/success';

// Investor schema
const InvestorSchema = z.object({
  ucc: z.string().describe('Unique Client Code'),
});

// Holder schema
const HolderSchema = z.object({
  holder_rank: z.nativeEnum(HolderRank).describe('Holder rank (1, 2, 3, -1 for guardian)'),
  email: z.string().email().describe('Holder email address'),
  mobnum: z.string().describe('Holder mobile number with country code'),
});

// Bank account schema (optional)
const BankAccountSchema = z.object({
  ifsc: z.string().describe('Bank IFSC code'),
  no: z.string().describe('Bank account number'),
  type: z.nativeEnum(BankAccountType).describe('Bank account type'),
});

// Depository account schema (optional)
const DepositoryAccountSchema = z.object({
  depository: z.nativeEnum(DepositoryCode).describe('Depository provider'),
  dp_id: z.string().describe('Depository participant ID'),
  client_id: z.string().describe('Client ID with depository'),
});

// Main SxP Request Schema
export const SxPRequestSchema = z.object({
  // ========== MANDATORY FIELDS ==========
  sxp_type: z.nativeEnum(SxPType).describe('Type of systematic transaction: sip, swp, stp, sprod, topup'),
  mem_sxp_ref_id: z.string().describe('Member SxP reference ID (unique identifier)'),
  investor: InvestorSchema.describe('Investor details with UCC'),
  member: z.string().describe('Member code'),
  src_scheme: z.string().describe('Source scheme code (BSE scheme code)'),
  amount: z.number().positive().describe('Transaction amount'),
  cur: z.nativeEnum(Currency).default(Currency.INR).describe('Currency (INR)'),
  is_fresh: z.boolean().describe('Whether this is a fresh SxP registration'),
  phys_or_demat: z.nativeEnum(PhysicalOrDemat).describe('Physical or Demat mode'),
  start_date: z.string().describe('SxP start date (YYYY-MM-DD)'),
  freq: z.nativeEnum(SxPFrequency).describe('Frequency: d, w, m, q, h, y'),
  is_nomination_opted: z.boolean().describe('Whether nomination is opted'),
  holder: z.array(HolderSchema).min(1).describe('Array of holders (at least primary holder)'),

  // ========== OPTIONAL FIELDS ==========
  kyc_passed: z.boolean().optional().describe('KYC verification status'),
  dest_scheme: z.string().optional().describe('Destination scheme (for STP)'),
  amc_code: z.string().optional().describe('AMC code'),
  exch_mandate_id: z.number().optional().describe('Exchange mandate ID'),
  src_folio: z.string().optional().describe('Source folio number'),
  dest_folio: z.string().optional().describe('Destination folio number (for STP)'),
  isunits: z.boolean().optional().describe('Whether transaction is in units'),
  end_date: z.string().nullable().optional().describe('SxP end date (YYYY-MM-DD)'),
  txn_date: z.number().optional().describe('Transaction date of the month'),
  payment_ref_id: z.string().optional().describe('Payment reference ID'),
  remark: z.string().optional().describe('Additional remarks'),
  dpc: z.boolean().optional().describe('DPC flag'),
  email: z.string().email().optional().describe('Primary email address'),
  mobnum: z.string().optional().describe('Primary mobile number'),
  first_order_today: z.boolean().optional().describe('Whether first order is today'),
  brokerage: z.number().optional().describe('Brokerage percentage'),
  ninstallments: z.number().optional().describe('Number of installments'),
  depository_acct: DepositoryAccountSchema.optional().describe('Depository account details'),
  bank_acct: BankAccountSchema.optional().describe('Bank account details'),
  nomination_auth_mode: z.nativeEnum(NominationAuthMode).optional().describe('Nomination authentication mode'),
});

// Inferred TypeScript type
export type SxPRequest = z.infer<typeof SxPRequestSchema>;

// BSE SxP Registration Response Schema
// Two possible response formats:
// 1. Standard response: { data: { id: "98765432123456789" } }
// 2. First Order Today (FOT=true): { data: { order_id: 0, sxp_id: "98765432123456789" } }
export const SxPRegisterResponseSchema =bseSuccessResponseSchema.extend({
  data: z.union([
    // Standard response
    z.object({
      id: z.string().describe('SxP registration ID'),
    }),
    // First Order Today response (FOT=true)
    z.object({
      order_id: z.number().describe('Order ID (when first_order_today is true)'),
      sxp_id: z.string().describe('SxP registration ID'),
    }),
  ]),
});

// Inferred TypeScript type for response
export type SxPRegisterResponse = z.infer<typeof SxPRegisterResponseSchema>;

// ===============================
// SxP Cancellation (BSE wire format)
// BSE StARMF v2 API §6.2.4.2 sxp_cancel
// ===============================

/**
 * Candidate spellings for the SxP-type field in the /sxp_cancel request body,
 * in the order they should be attempted.
 *
 * RESOLVED AGAINST LIVE BSE UAT on 2026-08-25 (member 91011, host
 * starmfv2demo.bseindia.com). The docs contradict themselves — the §6.2.4.2
 * spec table (API doc line 2016) declares `sxp_type`, while the §8.3.2.1
 * example (line 11350) sends `"type": "SIP"` — so it was probed directly:
 *
 *   omit the field entirely  -> 400 {"msgid":522,"errcode":"required","field":"Type"}
 *   "type": "SIP"            -> 400 {"msgid":522,"errcode":"required","field":"Type"}
 *   "sxp_type": "sip"        -> 400 {"msgid":507,"errcode":"record_not_found",...}
 *   "sxp_type": "SIP"        -> 400 {"msgid":507,"errcode":"record_not_found",...}
 *   "sxp_type": "XSIP"       -> 400 {"msgid":507,"errcode":"record_not_found",...}
 *
 * `record_not_found` means the payload passed validation and BSE went looking
 * for the (deliberately non-existent) registration. So:
 *
 *   - `sxp_type` is the real field name. BSE ignores `type` outright — the
 *     chapter-8 example is simply wrong.
 *   - Casing is tolerated; `sip`, `SIP` and `XSIP` all pass.
 *
 * The ladder is kept, trimmed to three, because the probe ran against the UAT
 * member and production is a different member code — if its gateway ever
 * disagrees, the caller still resolves at runtime instead of failing outright.
 * The first entry is the confirmed-good pair, so in practice attempt 1 wins and
 * the result is cached for the process.
 *
 * DO NOT collapse this into sending several keys at once. BSE has live
 * rejection codes for unexpected fields (561 "{<field>} is not allowed",
 * 3669 "invalid_field").
 *
 * Also confirmed by the same probe: the endpoint path is bare `/sxp_cancel`.
 * `/v2/sxp_cancel` returns a hard "404 page not found".
 *
 * Corroborated 2026-08-25 by BSE's own Postman collection and the StAR MF 2.0
 * Integration Portal (Live Production), both of which POST to bare
 * `/sxp_cancel` with `"sxp_type": "SIP"`. Uppercase leads the ladder for that
 * reason, even though UAT accepts either casing.
 */
export const SXP_CANCEL_TYPE_CANDIDATES: ReadonlyArray<{
  readonly field: 'sxp_type' | 'type';
  readonly value: string;
}> = [
  { field: 'sxp_type', value: 'XSIP' },
  { field: 'sxp_type', value: 'SIP' },
  { field: 'sxp_type', value: 'sip' },
  { field: 'type', value: 'SIP' },
] as const;

/**
 * BSE's sxp_type for a mandate-linked SIP.
 *
 * Confirmed in production 2026-08-26: cancelling a mandate-linked SIP with
 * `sxp_type: "SIP"` is refused with
 * `{"msgid":507,"errcode":"record_not_found","field":"id/type"}` — the
 * registration number is right, the type is not. `sxp_get` reports these back
 * as `"sxp_type": "XSIP"` (API doc line 11686).
 *
 * The earlier UAT probe could not have caught this: it used a non-existent
 * registration number, and with no record to match, every type value returns
 * the same 507.
 */
export const SXP_TYPE_MANDATE_LINKED = 'XSIP';

/** BSE's sxp_type for a SIP with no mandate attached. */
export const SXP_TYPE_STANDALONE = 'SIP';

export type SxPCancelTypeVariant = (typeof SXP_CANCEL_TYPE_CANDIDATES)[number];

/** Fixed fields of the /sxp_cancel request body (inside the `data` envelope). */
export interface SxPCancelRequestBase {
  /** BSE-assigned SxP registration number — SIP.bseSxpRegNum (API doc line 2013) */
  reg_no: string;
  /** sxp_cancel_reason code 1-13, see SxPCancelReasonMapping (§7.4.51) */
  reason_cd: number;
  /** Free text; mandatory only when reason_cd is 13 (Others), else '' */
  reason_cd_msg: string;
}

/**
 * Full /sxp_cancel request body. The SxP-type key is added dynamically under
 * SXP_CANCEL_TYPE_FIELD, hence the index signature.
 */
export type SxPCancelRequest = SxPCancelRequestBase & Record<string, string | number>;

/**
 * Success response. `data.id` is an opaque acknowledgement id (§8.3.2.2 shows
 * `"id": "4"`); the docs never define what it identifies, so it is logged and
 * never persisted. The authoritative confirmation is the SXP webhook.
 */
export const SxPCancelResponseSchema = bseSuccessResponseSchema.extend({
  data: z.object({
    id: z.union([z.string(), z.number()]).describe('Opaque cancellation acknowledgement id'),
  }),
});

export type SxPCancelResponse = z.infer<typeof SxPCancelResponseSchema>;

// Export the schema as default
export default SxPRequestSchema;
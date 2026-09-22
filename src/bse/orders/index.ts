import { z } from 'zod';
import {
  ApiStatus,
  Currency,
  HolderRank,
  HoldingNature,
  OrderLifecycleStatus,
  OrderSource,
  OrderStatus,
  OrderTypeCode,
  PhysicalOrDemat,
  UCCStatus,
} from '../enums/v2Enums';
import { BseOrderDataSchema } from '../../order-get';

const OrderHolderSchema = z.object({
  holder_rank: z.string(),
  email: z.string().email(),
  mobnum: z.string(),
  is_nomination_opted: z.boolean(),
  nomination_auth_mode: z.string().optional(),
});

export const BseOrderSchema = z.object({
  type: z.nativeEnum(OrderTypeCode), // "p" for purchase, "r" for redemption, "s" for switch
  mem_ord_ref_id: z.string(),
  investor: z.object({
    ucc: z.string(),
  }),
  member: z.string(),
  scheme: z.string(),
  amount: z.number(),
  cur: z.nativeEnum(Currency),
  min_redeem_flag: z.boolean(),
  is_fresh: z.boolean(),
  dst_folio: z.string(),
  phys_or_demat: z.nativeEnum(PhysicalOrDemat),
  src: z.nativeEnum(OrderSource),
  holder: z.array(OrderHolderSchema),
  is_nomination_opted: z.boolean(),
});
/**
 * Wrapper schema for the complete BSE order payload
 * This includes the data object with orders array
 */
export const BseOrderPayloadSchema = z.object({
  data: z.object({
    orders: z.array(BseOrderSchema),
  }),
});

export type BseOrder = z.infer<typeof BseOrderSchema>;
export type BseOrderPayload = z.infer<typeof BseOrderPayloadSchema>;

/**
 * order_holder — BSE API doc §7.3.39, lines 4965-4976. BSE documents exactly
 * three attributes: holder_rank (line 4974), email (4975), mobnum (4976).
 * is_nomination_opted (line 1592) and nomination_auth_mode (1593) are
 * ORDER-level fields, not holder-level; the purchase path nests them inside
 * the holder and BSE tolerates that on type "p", but no redemption has ever
 * been placed, so it is unproven for type "r" and BSE rejects unexpected
 * fields (561 "{<field>} is not allowed"). Redemption-only on purpose —
 * OrderHolderSchema above stays as the live purchase path has it.
 */
const RedemptionHolderSchema = z
  .object({
    holder_rank: z.nativeEnum(HolderRank),
    // BSE marks holder email M=N (line 4975) and its OWN redeem reference
    // sends "email": "" inside holder (postman-1.md line 38). Requiring a
    // valid address here would reject BSE's own sample, and would make a
    // redemption unconstructable for any UCC with no email on file.
    // Validate when a value is present; allow the documented empty form.
    email: z.string().email().or(z.literal('')),
    mobnum: z.string().min(1),
  })
  .strict();

/**
 * Redemption order schema — BSE StARMF v2 order_new, API doc §6.2.3.1
 *
 * Deliberately separate from BseOrderSchema: a redemption carries folio,
 * is_units and all_units, and must not carry src or dst_folio. Loosening the
 * purchase schema instead would let a purchase silently omit is_fresh or send
 * a folio.
 *
 * Deliberately absent: src, dst_folio, dpc, bank_acct, depository_acct,
 * dest_scheme — every one is optional or demat-only, and BSE rejects
 * unexpected fields (561 "{<field>} is not allowed", 3669 "invalid_field").
 * .strict() makes any of them a loud ZodError here instead of a silent strip,
 * so a payload copied from the purchase path fails locally, not at BSE.
 *
 * The base object is module-local and unrefined because .superRefine() has to
 * wrap a plain object; validate against BseRedemptionOrderSchema below, which
 * adds the all_units and amount invariants.
 */
const BseRedemptionOrderBaseSchema = z
  .object({
    type: z.literal(OrderTypeCode.REDEMPTION), // "r" — redemption only
    // 1-32 chars, "Allowed values: Numbers and hyphen" (BSE line 1557). Read
    // as a number using hyphens as separators, so at least one digit is
    // required: the bare character class accepted all-hyphen values such as
    // '-' and '----'. The lookahead adds that digit requirement; the character
    // set itself is unchanged and stays inside what BSE allows.
    mem_ord_ref_id: z.string().regex(/^(?=.*[0-9])[0-9-]{1,32}$/),
    // .strict() here too: investor was the last nested object that silently
    // STRIPPED unknown keys, which is the failure class the rest of this
    // schema exists to make loud. .min(1) on the identifiers below because
    // all three are BSE-mandatory (M=Y) and an empty string builds a
    // structurally valid payload that BSE rejects on the wire.
    investor: z
      .object({
        ucc: z.string().min(1),
      })
      .strict(),
    member: z.string().min(1),
    scheme: z.string().min(1),
    // rupees, units when is_units, or 0 when all_units (BSE line 1563)
    // .finite() because Infinity passes z.number() and JSON.stringify turns it
    // into null; the > 0 bound lives in the refinement, since all_units mode
    // legitimately requires exactly 0
    amount: z.number().finite(),
    cur: z.nativeEnum(Currency),
    is_units: z.boolean(),
    all_units: z.boolean(), // physical only (BSE line 1566); see refinement
    // BSE marks min_redeem_flag M=N (optional) at line 1569, "Applicable only
    // for redemption". Required here on purpose, so every caller has to decide
    // whether to waive the scheme's minimum-unit rule. Do not add .optional().
    min_redeem_flag: z.boolean(),
    // The prose rule at API doc line 1568 (M=Y) reads: "is_fresh must be set
    // to true when placing the first purchase order else false" — i.e. false
    // on a sell. BSE's own reference requests contradict it. In postman-1.md
    // (BSE-supplied order_new samples) the redeem-physical request opens with
    // "type": "r" at line 7 and sends "is_fresh": true at line 27; the
    // redeem-demat request opens with "type": "r" at line 70 and sends it at
    // line 90. The purchase sample opens with "type": "p" at line 181 and
    // carries the identical "is_fresh": true at line 201 — the same value in
    // all three is what marks it as template carry-over rather than a
    // documented redemption rule.
    //
    // z.boolean() and NOT z.literal(false) is deliberate (spec §2.9): if UAT
    // shows BSE really wants true on a sell, the caller changes the value and
    // no schema edit is needed. Do not narrow this type.
    is_fresh: z.boolean(),
    // BSE line 1567 allows numbers and "/" followed by 2 digits, and validates
    // the format server-side. No client regex: an over-tight one risks
    // blocking a legitimate legacy folio. Only the length bounds are pinned,
    // because 1-28 is unambiguous
    folio: z.string().min(1).max(28),
    // dpc omitted. Safe on the wire: BSE marks dpc M=N at API doc line 1591,
    // so leaving it out is always a valid request. It is NOT settled beyond
    // that, and the earlier "template carry-over, not redemption semantics"
    // claim overstated it. The doc defines dpc two incompatible ways:
    //   line 1591 (order_new): "Specifies if it is direct payout to client"
    //   line 2442 (sxp mod):   "Dividend payout choice. true/false"
    // The carry-over evidence is real but only argues against copying BSE's
    // value blindly: in postman-1.md BSE sends "dpc": true identically on
    // redeem physical (line 60), redeem demat (line 123) and purchase
    // (line 234). Under the line-1591 reading, omitting dpc on a SELL leaves
    // BSE to apply its own default for WHERE the proceeds land — M5-relevant.
    // This is the FIRST thing to confirm on the UAT redemption: if payout
    // lands anywhere other than the client's registered bank account, revisit
    // this omission.
    phys_or_demat: z.literal(PhysicalOrDemat.PHYSICAL),
    // The next three are all M=N (optional) in BSE's order_new table —
    // kyc_passed line 1588, email line 1584, mobnum line 1586 — yet required
    // here on purpose, so every caller has to supply them instead of silently
    // dropping contact details from a payout-bearing order. Do not add
    // .optional() assuming BSE demands them, and do not relax them assuming
    // the strictness was an oversight.
    kyc_passed: z.boolean(),
    email: z.string().email(),
    mobnum: z.string(), // with country code, e.g. "+919876543210"
    is_nomination_opted: z.literal(false),
    // BSE line 1596 permits up to 3 holders (M=C, List=Y) and says "For
    // excluded members with folio, primary holder is mandatory". A redemption
    // always carries a folio, so BSE needs exactly one holder AND that holder
    // must be the primary one. .length(1) pins the COUNT but not the RANK: a
    // lone holder ranked '2' or '-1' satisfied it, which let a payload ship
    // with no primary holder at all. Re-pinning holder_rank closes that.
    // HolderRank.PRIMARY is '1' = "First/Primary Holder" (API doc §7.4.7,
    // line 6238). .extend() preserves the .strict() on RedemptionHolderSchema
    // (verified against zod 3.25.67), so unknown holder keys still fail loudly.
    holder: z
      .array(
        RedemptionHolderSchema.extend({
          holder_rank: z.literal(HolderRank.PRIMARY),
        }),
      )
      .length(1),
  })
  .strict();

/**
 * BSE line 1566: when all_units is true, amount must be 0 and is_units must
 * also be true. Outside all_units mode the amount must be > 0 — a zero or
 * negative redemption is meaningless. Issues are reported on the offending
 * field, not the object.
 *
 * Note lines 1663 and 1935 restate all_units without the "physical only"
 * clause; line 1566 is the authoritative order_new row.
 */
export const BseRedemptionOrderSchema =
  BseRedemptionOrderBaseSchema.superRefine((data, ctx) => {
    if (!data.all_units) {
      if (data.amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'amount must be greater than 0 when all_units is false',
          path: ['amount'],
        });
      }
      return;
    }
    if (data.amount !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'amount must be 0 when all_units is true',
        path: ['amount'],
      });
    }
    if (!data.is_units) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'is_units must be true when all_units is true',
        path: ['is_units'],
      });
    }
  });

/**
 * Wrapper schema for the complete BSE redemption order payload
 * Mirrors BseOrderPayloadSchema; z.array carries the refined schema, so the
 * all_units invariant is enforced for every order in the payload. .min(1)
 * because an empty batch would POST as a successful-looking no-op
 *
 * Both wrapper objects are .strict() as well. Order-level .strict() only
 * catches a stray key inside an order, so without these an extra key at the
 * payload root or inside `data` would be silently dropped — the exact failure
 * class order-level .strict() exists to catch, escaping one level up.
 * BseOrderPayloadSchema above (the live purchase path) is left untouched.
 */
export const BseRedemptionOrderPayloadSchema = z
  .object({
    data: z
      .object({
        orders: z.array(BseRedemptionOrderSchema).min(1),
      })
      .strict(),
  })
  .strict();

export type BseRedemptionOrder = z.infer<typeof BseRedemptionOrderSchema>;
export type BseRedemptionOrderPayload = z.infer<
  typeof BseRedemptionOrderPayloadSchema
>;

/**
 * Schema for lumpsum order response
 */
export const LumpsumOrderResponseSchema = z.object({
  status: z.string(),
  data: z.object({
    items: z.array(
      z.object({
        mem_ord_ref_id: z.string(),
        id: z.number(),
        status: z.string(),
      }),
    ),
  }),
  messages: z.array(z.unknown()),
});

export type LumpsumOrderResponse = z.infer<typeof LumpsumOrderResponseSchema>;

/**
 * Order Status Get — Request Schemas
 * For the BSE order_get endpoint
 */

export const OrderStatusFilterParamSchema = z.object({
  open_close: z.nativeEnum(OrderStatus).optional(), // 'o' for open, 'c' for closed
});

export type OrderStatusFilterParam = z.infer<typeof OrderStatusFilterParamSchema>;

export const OrderStatusGetRequestBodySchema = z.object({
  id: z.number().int().positive(), // BSE Order ID — BSE requires a NUMBER; sending a string is rejected with invalid_json (msgid 622)
  filter_param: OrderStatusFilterParamSchema.optional(),
});

export type OrderStatusGetRequestBody = z.infer<typeof OrderStatusGetRequestBodySchema>;

export const OrderStatusGetRequestSchema = z.object({
  data: OrderStatusGetRequestBodySchema,
});

export type OrderStatusGetRequest = z.infer<typeof OrderStatusGetRequestSchema>;

/**
 * Order Status Get — Response Schemas
 */

export const AllotmentDetailsSchema = z.object({
  allotment_date: z.string().optional(),
  allotment_partial_full: z.string().optional(), // 'FULL' or 'PARTIAL'
  allotment_units: z.string().optional(),
  short_units: z.string().optional(),
  allotment_amount: z.string().optional(),
  allotment_nav: z.string().optional(),
  nav_date: z.string().optional(),
  folio: z.string().optional(),
  stt: z.string().optional(),        // Securities Transaction Tax
  stamp_duty: z.string().optional(),
});

export type AllotmentDetails = z.infer<typeof AllotmentDetailsSchema>;

/**
 * Redemption Details Schema
 * Fields returned in the redempt_details object from BSE order_get response
 */
export const RedemptDetailsSchema = z.object({
  redempt_date: z.string().optional(),       // Date of redemption
  redempt_units: z.string().optional(),      // Units redeemed
  redempt_amount: z.string().optional(),     // Amount redeemed
  redempt_nav: z.string().optional(),        // NAV used for redemption
  nav_date: z.string().optional(),           // NAV date
  folio: z.string().optional(),              // Folio number
  tds: z.string().optional(),               // Tax Deducted at Source
  exit_load: z.string().optional(),          // Exit load applied
  payout_date: z.string().optional(),        // Payout date
  payout_utr: z.string().optional(),         // Payout UTR number
  bank_acct: z.string().optional(),          // Beneficiary bank account
  paymt_mode: z.string().optional(),         // Payment mode (e.g., NEFT, RTGS)
  dispatch_ref_no: z.string().optional(),    // Dispatch reference number
});

export type RedemptDetails = z.infer<typeof RedemptDetailsSchema>;

export const OrderStatusGetResponseDataSchema = BseOrderDataSchema.extend({
  // Override allotment_details with typed schema
  allotment_details: AllotmentDetailsSchema.optional().nullable(),
  // Override redempt_details with typed schema
  redempt_details: RedemptDetailsSchema.optional().nullable(),
  // Additional fields from full order_get response
  client_code: z.string().optional(),
  holding_nature: z.nativeEnum(HoldingNature).optional(),
  is_client_demat: z.boolean().optional(),
  is_client_physical: z.boolean().optional(),
  member_code: z.string().optional(),
  primary_holder_name: z.string().optional(),
  tax_status: z.string().optional(),
  ucc_status: z.nativeEnum(UCCStatus).optional(),
  is_nomination_opted: z.boolean().optional(),
  nomination_auth_mode: z.string().optional(),
  nominee_soa: z.string().optional(),
  manually_upadated_at: z.string().optional(), // API field name (BSE typo preserved)
  threshold_rejected_by: z.string().optional(),
  threshold_rejected_at: z.string().optional(),
  match_bank_rcpt_id: z.number().optional(),
});

export type OrderStatusGetResponseData = z.infer<typeof OrderStatusGetResponseDataSchema>;

export const OrderStatusGetResponseSchema = z.object({
  status: z.nativeEnum(ApiStatus),
  data: OrderStatusGetResponseDataSchema.optional().nullable(),
  messages: z.array(z.unknown()),
});

export type OrderStatusGetResponse = z.infer<typeof OrderStatusGetResponseSchema>;

import { z } from 'zod';
import {
  ApiStatus,
  Currency,
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
  id: z.string(), // BSE Order ID
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

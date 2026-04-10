import { z } from 'zod';
import { OrderStatus } from './bse/enums/v2Enums';

/**
 * Order List Query Parameters Schema
 * Request format for fetching list of orders from BSE via query params
 */
export const OrderListParamsSchema = z.object({
  open_close: z.nativeEnum(OrderStatus), // 'o' for open, 'c' for closed - Mandatory
});

export type OrderListParams = z.infer<typeof OrderListParamsSchema>;

/**
 * BSE Order List Request Schema (with data wrapper)
 * Full request structure sent to BSE API
 */
export const BseOrderListRequestSchema = z.object({
  data: z.object({
    fields: z.array(z.string()),
    start: z.number().int().nonnegative(),
    length: z.number().int().positive(),
    filter_param: z.object({
      open_close: z.enum(['o', 'c']),
      ucc: z.array(z.string()),
      member_code: z.string(),
    }),
  }),
});

export type BseOrderListRequest = z.infer<typeof BseOrderListRequestSchema>;

/**
 * Order List Item Schema
 * Individual order item structure from BSE
 */
export const OrderListItemSchema = z.object({
  id: z.number(),
  exch_order_id: z.string().optional(),
  type: z.string().optional(),
  mem_ord_ref_id: z.string().optional(),
  investor: z.any().optional(),
  member: z.string().optional(),
  scheme: z.string().optional(),
  amount: z.string().optional(),
  cur: z.string().optional(),
  is_units: z.boolean().optional(),
  all_units: z.boolean().optional(),
  is_fresh: z.boolean().optional(),
  folio_num: z.string().optional(),
  phys_or_demat: z.string().optional(),
  settlement_no: z.string().optional(),
  rta_txn_no: z.string().optional(),
  rta_remark: z.string().optional(),
  reg_no: z.string().optional(),
  payment_ref_id: z.string().optional(),
  payment_aggr_code: z.string().optional(),
  settement_date: z.string().optional(),
  settlement_type: z.string().optional(),
  pg_ref_no: z.string().optional(),
  fund_receipt_date: z.string().optional(),
  status: z.string().optional(),
  mem_2fa: z.string().optional(),
  mem_2fa_action_at: z.string().optional(),
  mem_paymt: z.string().optional(),
  email: z.string().optional(),
  mobnum: z.string().optional(),
  placed_at: z.string().optional(),
  exch_mandate_id: z.number().optional(),
  kyc_passed: z.boolean().optional(),
  tracker_id: z.string().optional(),
  dpc: z.boolean().optional(),
  remarks: z.string().optional(),
  dest_scheme: z.string().optional(),
  matched_pa_ids: z.number().optional(),
  pa_matched_at: z.string().optional(),
  matched_bank_rcpt: z.any().nullable().optional(),
  bank_matched_at: z.string().optional(),
  full_matched_at: z.string().optional(),
  rta_resp_at: z.string().optional(),
  rta_resp: z.any().nullable().optional(),
  dp_resp: z.any().nullable().optional(),
  refund_details: z.any().nullable().optional(),
  threshold_isapproved: z.boolean().optional(),
  expires_at: z.string().optional(),
  order_added_at: z.string().optional(),
  dest_folio: z.string().optional(),
  client_code: z.string().optional(),
  holding_nature: z.string().optional(),
  is_client_demat: z.boolean().optional(),
  is_client_physical: z.boolean().optional(),
  member_code: z.string().optional(),
  primary_holder_name: z.string().optional(),
  tax_status: z.string().optional(),
  ucc_status: z.string().optional(),
  is_nomination_opted: z.boolean().optional(),
  nomination_auth_mode: z.string().optional(),
  nominee_soa: z.string().optional(),
  nomination: z.array(z.any()).optional(),
  holder: z.array(z.any()).optional(),
  info: z.any().optional(),
  order_src_info: z.any().optional(),
  depository_acct: z.any().optional(),
  bank_acct: z.any().optional(),
  rejection_reason: z.any().nullable().optional(),
  history: z.array(z.any()).optional(),
  allotment_details: z.any().nullable().optional(),
  redempt_details: z.any().nullable().optional(),
});

export type OrderListItem = z.infer<typeof OrderListItemSchema>;

/**
 * BSE Order List Response Schema
 * Response structure from BSE API
 */
export const BseOrderListResponseSchema = z.object({
  status: z.enum(['success', 'error']).optional(),
  data: z
    .object({
      total_count: z.number(),
      lists: z.array(OrderListItemSchema),
    })
    .optional(),
  messages: z.array(z.string()).optional(),
});

export type BseOrderListResponse = z.infer<typeof BseOrderListResponseSchema>;

/**
 * API Order List Response
 * Response format returned to API consumers
 */
export interface ApiOrderListResponse {
  status: 'success' | 'error';
  data?: {
    totalCount: number;
    lists: OrderListItem[];
  };
  messages?: string[];
}

import { z } from 'zod';

/**
 * SIP History Filter Parameters Schema
 * Used to filter SIP transaction history results
 */
export const SipHistoryFilterParamSchema = z.object({
  no_of_txn: z.number().int().positive().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});

export type SipHistoryFilterParam = z.infer<typeof SipHistoryFilterParamSchema>;

/**
 * SIP History Request Body Schema
 * Request format for fetching SIP history from BSE
 */
export const SipHistoryRequestBodySchema = z.object({
  reg_no: z.string().min(1, 'SIP registration number is required'),
  fields: z.array(z.string()).min(1, 'At least one field is required'),
  filter_param: SipHistoryFilterParamSchema.optional(),
});

export type SipHistoryRequestBody = z.infer<typeof SipHistoryRequestBodySchema>;

/**
 * BSE SIP History Request Schema (with data wrapper)
 * Full request structure sent to BSE API
 */
export const BseSipHistoryRequestSchema = z.object({
  data: SipHistoryRequestBodySchema,
});

export type BseSipHistoryRequest = z.infer<typeof BseSipHistoryRequestSchema>;

/**
 * History Event Schema
 * Individual event in the transaction history timeline
 */
export const HistoryEventSchema = z.object({
  event_status: z.string(),
  msg: z.string(),
  when: z.string(),
  user: z.string(),
});

export type HistoryEvent = z.infer<typeof HistoryEventSchema>;

/**
 * SIP Transaction Schema
 * Individual SIP transaction/order in the history
 */
export const SipTransactionSchema = z.object({
  all_units: z.boolean(),
  amount: z.number(),
  cur: z.string(),
  date: z.string(),
  dest_folio: z.string(),
  dest_scheme: z.string(),
  folio: z.string(),
  history: z.array(HistoryEventSchema),
  id: z.number(),
  is_units: z.boolean(),
  mem_ord_ref_id: z.string(),
  member: z.string(),
  payment_ref_id: z.string(),
  phys_or_demat: z.string(),
  regst_no: z.string(),
  src_scheme: z.string(),
  status: z.string(),
  txn_type: z.string(),
  ucc: z.string(),
});

export type SipTransaction = z.infer<typeof SipTransactionSchema>;

/**
 * BSE SIP History Response Data Schema
 * Data portion of the BSE response
 */
export const BseSipHistoryResponseDataSchema = z.object({
  lists: z.array(SipTransactionSchema),
});

export type BseSipHistoryResponseData = z.infer<
  typeof BseSipHistoryResponseDataSchema
>;

/**
 * BSE SIP History Response Schema
 * Complete response structure from BSE API
 */
export const BseSipHistoryResponseSchema = z.object({
  status: z.string(),
  data: BseSipHistoryResponseDataSchema,
  messages: z.null().or(z.array(z.unknown())),
});

export type BseSipHistoryResponse = z.infer<typeof BseSipHistoryResponseSchema>;

/**
 * API SIP History Response Schema
 * Wrapper response returned by our API endpoint
 */
export const ApiSipHistoryResponseSchema = z.object({
  status: z.string(),
  data: BseSipHistoryResponseDataSchema,
  messages: z.array(z.unknown()),
});

export type ApiSipHistoryResponse = z.infer<typeof ApiSipHistoryResponseSchema>;

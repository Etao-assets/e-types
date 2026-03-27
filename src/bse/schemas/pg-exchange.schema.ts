import { z } from 'zod';

// ── Our API Payload Schema (client → our API) ────────────────────────────────

export const pgExchangeApiRequestSchema = z.object({
  order_ids: z
    .array(z.string().min(1, 'Order ID must be a non-empty string'))
    .min(1, 'At least one order ID is required'),
  redirection_url: z.string().url().optional(),
});

export type PgExchangeApiRequest = z.infer<typeof pgExchangeApiRequestSchema>;

// ── BSE API Payload Schema (our API → BSE) ───────────────────────────────────

export const bseMemDetailsSchema = z.object({
  euin: z.string().default(''),
  euin_flag: z.boolean().default(false),
  sub_br_code: z.string().default(''),
  sub_br_arn: z.string().default(''),
  partner_id: z.string().default(''),
});

export const bsePgExchangeRequestSchema = z.object({
  data: z.object({
    mem_details: bseMemDetailsSchema,
    investor: z.object({
      ucc: z.string(),
    }),
    order_ids: z.array(z.number().int().positive()).min(1),
    requested_method: z.enum(['exch_pg_page', 'payment_info_data']),
    payment_mode: z.array(z.enum(['upi', 'netbanking', 'mandate'])),
    redirection_url: z.string().optional(),
  }),
});

export type BseMemDetails = z.infer<typeof bseMemDetailsSchema>;
export type BsePgExchangeRequest = z.infer<typeof bsePgExchangeRequestSchema>;

// ── BSE API Response ─────────────────────────────────────────────────────────

export const bsePgPaymentInformationSchema = z.object({
  payment_mode: z.string(),
  get_bank_account_details_row: z.unknown().nullable(),
  mode_additional_info: z.string(),
});

export const bsePgExchangeResponseSchema = z.object({
  data: z.object({
    exch_pg_page_link: z.string(),
    payment_information: bsePgPaymentInformationSchema,
  })
});

export type BsePgPaymentInformation = z.infer<typeof bsePgPaymentInformationSchema>;
export type BsePgExchangeResponse = z.infer<typeof bsePgExchangeResponseSchema>;

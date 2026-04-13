import { z } from 'zod';
import { PaymentMode } from '../enums/paymentMode';

// ── Client → Our API Schema ───────────────────────────────────────────────────

export const sendPaymentInfoApiRequestSchema = z.object({
  order_ids: z
    .array(z.number().int().positive())
    .min(1, 'At least one order ID is required'),
  payment_mode: z.nativeEnum(PaymentMode),
  bank_account: z.object({
    vpa: z.string().optional(),
    account_number: z.string().min(1, 'Account number is required'),
    ifsc: z.string().min(1, 'IFSC code is required'),
  }),
});

export type SendPaymentInfoApiRequest = z.infer<
  typeof sendPaymentInfoApiRequestSchema
>;

// ── Our API → BSE Payload Schema ─────────────────────────────────────────────

export const bseSendPaymentInfoRequestSchema = z.object({
  data: z.object({
    payment_mode: z.nativeEnum(PaymentMode),
    order_ids: z.array(z.number().int().positive()),
    ucc: z.string(),
    member: z.string(),
    amount: z.number().positive(),
    currency: z.string().default('INR'),
    redirection_url: z.string(),
    payment_details: z.object({
      bank_account: z.object({
        vpa: z.string(),
        bank_id: z.string(),
        account_number: z.string(),
        ifsc: z.string(),
        is_retail: z.boolean(),
        is_corporate: z.boolean(),
      }),
      exch_mandate_id: z.union([z.string(), z.number()]),
    }),
  }),
});

export type BseSendPaymentInfoRequest = z.infer<
  typeof bseSendPaymentInfoRequestSchema
>;

// ── BSE → Our API Response Schema ────────────────────────────────────────────

const bsePaymentLinkSchema = z.object({
  href: z.string(),
  method: z.string(),
  parameters: z.record(z.unknown()),
  rel: z.string(),
});

export const bseSendPaymentInfoResponseSchema = z.object({
  status: z.string(),
  data: z.object({
    payment_mode: z.string(),
    ucc: z.string(),
    links: z.array(bsePaymentLinkSchema),
    status: z.string(),
    payment_ref_id: z.string(),
    transaction_id: z.string(),
    vpa_id: z.string(),
    message: z.string().nullable(),
  }),
  message: z.string().nullable().optional(),
  messages: z.string().nullable().optional(),
});

export type BseSendPaymentInfoResponse = z.infer<
  typeof bseSendPaymentInfoResponseSchema
>;

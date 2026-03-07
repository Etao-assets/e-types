import { z } from 'zod';
import { TwoFAEvents } from '../enums/v2Events2fa';

// ─── Request ─────────────────────────────────────────────────────────────────

export const TwoFAEventInvestorSchema = z.object({
  client_code: z.string(),
  pan_holder: z.array(z.string()),
  holding_nature: z.string(),
});

export const TwoFAEventRequestItemSchema = z.object({
  event: z.nativeEnum(TwoFAEvents),
  investor: TwoFAEventInvestorSchema,
  parent_client_code: z.string().optional(),
  member_code: z.string(),
});

export const TwoFAEventRequestSchema = z.object({
  data: z.array(TwoFAEventRequestItemSchema),
});

export type TwoFAEventRequest = z.infer<typeof TwoFAEventRequestSchema>;
export type TwoFAEventRequestItem = z.infer<typeof TwoFAEventRequestItemSchema>;
export type TwoFAEventInvestor = z.infer<typeof TwoFAEventInvestorSchema>;

// ─── Order Event Request (Simplified) ───────────────────────────────────────

export const TwoFAOrderEventRequestItemSchema = z.object({
  event: z.nativeEnum(TwoFAEvents),
  order: z.string(),
});

export const TwoFAOrderEventRequestSchema = z.object({
  data: z.array(TwoFAOrderEventRequestItemSchema),
});

export type TwoFAOrderEventRequest = z.infer<
  typeof TwoFAOrderEventRequestSchema
>;
export type TwoFAOrderEventRequestItem = z.infer<
  typeof TwoFAOrderEventRequestItemSchema
>;

// ─── Response ─────────────────────────────────────────────────────────────────

export const TwoFAEventObjectSchema = z.object({
  holder_rank: z.string(),
  pan: z.string(),
  '2fa_url': z.string(),
});

export const TwoFAEventActionSchema = z.object({
  msgcode: z.string(),
  at: z.string().datetime({ offset: true }),
  event: z.string(),
  event_object: z.array(TwoFAEventObjectSchema),
});

export const TwoFAEventResponseItemSchema = z.object({
  member: z.string(),
  investor: TwoFAEventInvestorSchema.extend({
    pan_holder: z.array(z.string()).nullable(),
  }),
  parent_client_code: z.string(),
  action: TwoFAEventActionSchema,
});

export const TwoFAEventResponseSchema = z.object({
  status: z.string(),
  data: z.array(TwoFAEventResponseItemSchema),
  messages: z.unknown().nullable(),
});

export type TwoFAEventResponse = z.infer<typeof TwoFAEventResponseSchema>;
export type TwoFAEventResponseItem = z.infer<
  typeof TwoFAEventResponseItemSchema
>;
export type TwoFAEventAction = z.infer<typeof TwoFAEventActionSchema>;
export type TwoFAEventObject = z.infer<typeof TwoFAEventObjectSchema>;

import { z } from 'zod';

export const CreateOrderSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  goalId: z.string(),
  investmentMode: z.enum(['SIP', 'LUMPSUM'], {
    errorMap: () => ({ message: 'Investment mode must be SIP or LUMPSUM' }),
  }),
  amount: z.number().positive('Amount must be positive'),
});

// Zod schemas for order types
export const CreateOrderParamsSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  goalId: z.string(),
  investmentMode: z.enum(['SIP', 'LUMPSUM'], {
    errorMap: () => ({ message: 'Investment mode must be SIP or LUMPSUM' }),
  }),
  amount: z.number().positive('Amount must be positive'),
  userId: z.string().min(1, 'User ID is required'),
});

export const OrderEntryResultSchema = z.object({
  TransCode: z.string().optional(),
  TransNo: z.string().optional(),
  OrderId: z.string().optional(),
  UserID: z.string().optional(),
  MemberId: z.string().optional(),
  ClientCode: z.string().optional(),
  BSERemarks: z.string().optional(),
  SuccessFlag: z.string().optional(),
});

// Inferred types from schemas
export type CreateOrderParams = z.infer<typeof CreateOrderParamsSchema>;
export type OrderEntryResult = z.infer<typeof OrderEntryResultSchema>;

export interface PurchaseRequestParams {
  transCode: string;
  transNo: string;
  orderId?: string;
  userId: string;
  memberId: string;
  clientCode: string;
  schemeCd: string;
  buySell: string;
  buySellType: string;
  dpTxn: string;
  orderVal: string;
  qty?: string;
  allRedeem: string;
  folioNo?: string;
  remarks?: string;
  kycStatus: string;
  refNo?: string;
  subBrCode?: string;
  euin?: string;
  euinVal: string;
  minRedeem: string;
  dpc: string;
  ipAdd?: string;
  password: string;
  passKey: string;
  param1?: string;
  param2?: string;
  param3?: string;
  mobileNo?: string;
  emailId?: string;
  mandateId?: string;
  filler1?: string;
  filler2?: string;
  filler3?: string;
  filler4?: string;
  filler5?: string;
  filler6?: string;
}

export const lumpSumOrderSchema = z.object({
  investmentGoalId: z.string(),
  planId: z.string(),
  amount: z.number().positive('Amount must be greater than 0'),
});
export type LumpSumOrder = z.infer<typeof lumpSumOrderSchema>;

// Direct lumpsum investment (no goal ID required — goal is created implicitly)
export const instantLumpsumOrderSchema = z.object({
  planId: z.string(),
  amount: z.number().positive('Amount must be greater than 0'),
});
export type InstantLumpsumOrder = z.infer<typeof instantLumpsumOrderSchema>;

export const cancelLumpSumOrderSchema = z.object({
  orderId: z.string(),
  remark: z.string().optional(),
});
export type CancelLumpSumOrder = z.infer<typeof cancelLumpSumOrderSchema>;

// Redeem request (ETAO-facing) — groupKey identifies the lot group to sell from
export const RedeemRequestSchema = z
  .object({
    // three live forms: a sipId, 'lumpsum:<schemeCode>', 'holding:<schemeCode>'
    groupKey: z.string().min(1),
    // required only when the lookup returns >1 lot; 1-28, length only and never
    // a format regex, matching the BSE bound (BSE line 1567)
    folio: z.string().min(1).max(28).optional(),
    mode: z.enum(['amount', 'units', 'all']),
    // required when mode is not 'all'; finite() keeps Infinity out of the unit
    // and amount arithmetic for in-process callers
    // No .positive() here: the superRefine below already enforces > 0 with
    // mode-aware wording, and having both fire surfaced TWO issues on the
    // same path for one bad field. .finite() stays — it rejects Infinity,
    // which the refinement's `> 0` check would otherwise accept.
    value: z.number().finite().optional(),
  })
  // .strict() sits on the object, before the refinement: a refined schema is a
  // ZodEffects and has no .strict(). An unknown key would otherwise be dropped
  // silently, so a caller's typo'd field never reaches the redemption path
  .strict()
  .superRefine((data, ctx) => {
    if (data.mode === 'all') {
      // Reject a stray value instead of ignoring it. {mode:'all', value:5000}
      // is what a UI sends when the user types an amount and then toggles
      // "redeem all"; accepting both leaves the amount-vs-whole-holding choice
      // to downstream code that this schema gave no signal to
      if (data.value !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "value must be omitted when mode is 'all'",
          path: ['value'],
        });
      }
      return;
    }
    if (data.value === undefined || data.value <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Value is required and must be > 0 unless mode is 'all'",
        path: ['value'],
      });
    }
  });
export type RedeemRequest = z.infer<typeof RedeemRequestSchema>;

export const OrderActionsSchema = z.object({
  cancel: z.boolean().optional(),
  redeem: z.boolean().optional(),
});
export type OrderActions = z.infer<typeof OrderActionsSchema>;

export const OrderActionResultSchema = z.object({
  cancel: z
    .object({
      canCancel: z.boolean(),
      visible: z.boolean(),
    })
    .optional(),
  redeem: z
    .object({
      canRedeem: z.boolean(),
      visible: z.boolean(),
    })
    .optional(),
});
export type OrderActionResult = z.infer<typeof OrderActionResultSchema>;

// Export order get schema
export * from './orderGetSchema';

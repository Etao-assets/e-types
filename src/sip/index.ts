import { z } from 'zod';
import { DateObjOrString } from '../date';
import { SxPCancelReasonMapping } from '../bse/enums/v2Enums';

// Main SIP registration schema
export const sxpDraftFormDataSchema = z.object({
  investmentGoalId: z.string(),
  planId: z.string(),
  amount: z.number().positive('Amount must be greater than 0'),
  startDate: DateObjOrString,
});

export const sxpConfirmFormDataSchema = z.object({
  draftSipId: z.string(),
  mandateId: z.string(),
});

export const updateDraftSipSchema = z.object({
  sipId: z.string(),
  investmentGoalId: z.string(),
  amount: z.number().positive('Amount must be greater than 0').optional(),
  startDate: DateObjOrString.optional(),
  planId: z.string().optional(),
});

export const sxpCancelDataSchema = z.object({
  sipId: z.string(),
  reason_cd: z.nativeEnum(SxPCancelReasonMapping),
  reason_cd_msg: z.string().optional(),
});

export const sxpTopupDataSchema = z.object({
  sipId: z.string(),
  amount: z.number().positive('Amount must be greater than 0'),
  startDate: DateObjOrString,
});

// Direct investment (no goal ID required — goal is created implicitly)
export const instantSipSchema = z.object({
  planId: z.string(),
  amount: z.number().positive('Amount must be greater than 0'),
  startDate: DateObjOrString,
});
export type InstantSip = z.infer<typeof instantSipSchema>;

// Type inference from the schema
export type sxpDraftFormData = z.infer<typeof sxpDraftFormDataSchema>;
export type sxpConfirmFormData = z.infer<typeof sxpConfirmFormDataSchema>;
export type UpdateDraftSip = z.infer<typeof updateDraftSipSchema>;
export type sxpCancelSip = z.infer<typeof sxpCancelDataSchema>;
export type sxpTopupSip = z.infer<typeof sxpTopupDataSchema>;
export * from './sxpRequest';
export * from './sipScheduling';
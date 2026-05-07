import { z } from "zod";
import { fixerraRedirectParamsSchema, type FixerraRedirectParams } from "./schemas";
import { DateObjOrString } from '../date';

export interface FixerraUser {
  mobile: string;
}

export interface GetSessionParams {
  userId: string;
  traceId?: string;
  /** Pre-fetched user — skips the DB lookup if provided */
  user?: FixerraUser;
  /**
   * When set, the session is launched in the context of an existing InvestmentGoal.
   * Written to FixerraPartnerUser.pendingGoalId so the BOOKING_STATUS webhook can
   * link the resulting booking to this goal (Flow 1).
   * Omit when launching directly without a goal context (Flow 2).
   */
  goalId?: string;
  /** Optional redirect query parameters forwarded to the Fixerra partner URL */
  redirectData?: Omit<FixerraRedirectParams, 'authCode'>;
}

export interface GetSessionApiResponse {
  webviewUrl: string;
}

export interface RegisterAndGetSessionApiResponse {
  /** Registration data */
  userId: string;
  mobile: string;
  fPartnerUserId: string;
  fPartnerId: string;
  referralLink?: string;
  isNewRegistration: boolean;
  /** Session data */
  webviewUrl: string;
}

export const SessionBodySchema = fixerraRedirectParamsSchema
  .omit({ authCode: true })
  .extend({
    goalId: z.string().optional(),
  });

export type FixerraSessionRequestBody = z.infer<typeof SessionBodySchema>;

/**
 * Fixerra Order List Item Schema
 * Shape of a single FD/RD booking returned by the bookings list API.
 */
export const FixerraOrderListItemSchema = z.object({
  id:              z.string(),
  src_scheme_name: z.string(),
  amount:          z.number(),
  status:          z.string(),
  info:            z.object({
    src: z.string(),
  }),
  placed_at: DateObjOrString,
});

export type FixerraOrderListItem = z.infer<typeof FixerraOrderListItemSchema>;
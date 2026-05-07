import { z } from "zod";

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

export const SessionBodySchema = z.object({
  goalId: z.string().optional(),
});

export type FixerraSessionRequestBody = z.infer<typeof SessionBodySchema>;
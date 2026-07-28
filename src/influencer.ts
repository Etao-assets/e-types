import { z } from 'zod';

/**
 * Influencer self-view: what a promoter sees about their own referral
 * performance in the mobile app.
 *
 * The influencer is identified server-side by matching their logged-in
 * `User.mobile` against `Influencer.phone` - there is no influencer login and
 * no influencer identifier is ever sent by the client.
 */

/** Response of GET /influencer/me */
export const influencerSelfSummarySchema = z.object({
  isInfluencer: z.boolean(),
  influencer: z
    .object({
      name: z.string(),
      /** null until an admin generates the code. */
      code: z.string().nullable(),
      /** null until an admin generates the code. */
      isActive: z.boolean().nullable(),
      totalReferrals: z.number(),
    })
    .optional(),
});

/** One entry of GET /influencer/me/referrals */
export const influencerReferralItemSchema = z.object({
  id: z.string(),
  /** First name only - the customer's surname is never exposed. */
  firstName: z.string(),
  /** Masked server-side, e.g. ******1234. */
  maskedMobile: z.string(),
  createdAt: z.union([z.string(), z.date()]),
});

export type InfluencerSelfSummary = z.infer<typeof influencerSelfSummarySchema>;
export type InfluencerReferralItem = z.infer<
  typeof influencerReferralItemSchema
>;

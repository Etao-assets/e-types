import { z } from 'zod';

/**
 * Group coins (v4, November 2026) — coins are earned by CIRCLE ACTIVITY only.
 *
 * Shared contract between etao-nextjs (server) and etao-mobile (client). The
 * server decides everything below; the client only renders what it is sent.
 *
 * Why v4: the client's lawyer advised that "1 coin = ₹1 invested" and coins
 * earned from investments are illegal in India. Nothing money-, KYC- or
 * identity-related may gate the game. The v3 wallet in ./contestRounds is
 * deprecated and no longer served; the week's play rules live in
 * ./contestParticipation.
 *
 * Rules (product decisions, final):
 *  - Coins belong to the CIRCLE (group), never to a member. There is no wallet,
 *    nothing is spent, nothing is refunded, and a circle's coins never decrease.
 *  - Creation credit: GROUP_COINS_CREATION_CREDIT, once per circle, the moment the
 *    circle has a name, a target amount > 0 and a target date — at creation, or
 *    later when the creator completes those goal details. Idempotent.
 *  - Join credit: GROUP_COINS_JOIN_CREDIT for every member who accepts an
 *    invitation (the creator never counts), once per member per circle: leaving
 *    and re-joining earns nothing twice. No other condition (no KYC, no
 *    investment, no account age). Join credits accrue even while the creation
 *    details are still incomplete.
 *  - Cap: a circle's coins stop at GROUP_COINS_CAP; credits beyond it are not
 *    written. Members leaving or goal edits never remove credits.
 *  - Qualification: coins >= CONTEST_QUALIFY_GROUP_COINS lets the circle take part
 *    in the weekly contest every week from then on (./contestParticipation).
 *    Permanent by construction. One CONTEST_QUALIFIED push when it happens.
 *  - Go-live: circles that exist when v4 ships are credited by the same rules.
 *
 * Storage (server): the existing `points_ledger` table, one row per credit with
 * `reason` = GroupCoinReasonEnum, `refType` = GroupCoinRefTypeEnum and `refId`
 * as documented on the enum, unique per (userId, refType, refId). Rows written by
 * the v3 money hooks stay in the table and are ignored by the circle total.
 */

/** Coins a circle earns once its name, target amount (> 0) and target date are all set. */
export const GROUP_COINS_CREATION_CREDIT = 500;
/** Coins a circle earns for each member (other than the creator) who accepts an invitation. */
export const GROUP_COINS_JOIN_CREDIT = 500;
/** A circle's coins never exceed this. */
export const GROUP_COINS_CAP = 1500;
/** Coins a circle needs to take part in the weekly contest. Equals the cap on purpose: qualified = capped. */
export const CONTEST_QUALIFY_GROUP_COINS = 1500;

/** `points_ledger.reason` of a v4 credit. */
export enum GroupCoinReasonEnum {
  GROUP_CREATED = 'GROUP_CREATED',
  MEMBER_JOINED = 'MEMBER_JOINED',
}
export const GroupCoinReasonSchema = z.nativeEnum(GroupCoinReasonEnum);

/**
 * `points_ledger.refType` of a v4 credit. The matching `refId`:
 *   GROUP_CREATED → the group id (userId = the creator)
 *   MEMBER_JOINED → `${groupId}:${userId}` (userId = the joiner)
 * With the table's unique (userId, refType, refId) this makes every credit idempotent.
 */
export enum GroupCoinRefTypeEnum {
  GROUP_CREATED = 'group_created',
  MEMBER_JOINED = 'member_joined',
}

// --- Pure helpers (server writes with them; client renders with them) -----------

/**
 * How many coins a credit of `credit` is actually worth for a circle that has
 * `coins` so far: the full credit below the cap, the remainder at the edge, 0 at
 * the cap. (1000, 500) → 500; (1200, 500) → 300; (1500, 500) → 0.
 */
export const groupCoinsCreditAmount = (coins: number, credit: number): number =>
  Math.max(0, Math.min(credit, GROUP_COINS_CAP - Math.max(0, coins)));

/** Progress towards qualification, 0–100, clamped. */
export const groupCoinsProgressPercent = (coins: number): number =>
  Math.max(0, Math.min(100, Math.round((Math.max(0, coins) / CONTEST_QUALIFY_GROUP_COINS) * 100)));

/**
 * Members who still have to join for the circle to qualify. `creationPending`
 * is true while the creation credit can still be earned (details incomplete);
 * that credit is then counted as coming, so the nudge does not over-ask.
 *   (0, false) → 3;  (500, false) → 2;  (0, true) → 2;  (1500, false) → 0.
 */
export const groupCoinsJoinsToQualify = (coins: number, creationPending: boolean): number => {
  const expected = Math.max(0, coins) + (creationPending ? GROUP_COINS_CREATION_CREDIT : 0);
  return Math.max(0, Math.ceil((CONTEST_QUALIFY_GROUP_COINS - expected) / GROUP_COINS_JOIN_CREDIT));
};

// --- Response shapes --------------------------------------------------------------

/** One credit line of a circle, newest first in `GroupCoinsSchema.entries`. */
export const GroupCoinEntrySchema = z.object({
  reason: GroupCoinReasonSchema,
  /** The member the credit is attributed to: the creator for GROUP_CREATED, the joiner for MEMBER_JOINED. */
  userId: z.string(),
  name: z.string().nullable(),
  isMe: z.boolean(),
  /** Coins actually written (cap-aware, see groupCoinsCreditAmount). */
  coins: z.number().int(),
  createdAt: z.coerce.date(),
});
export type GroupCoinEntry = z.infer<typeof GroupCoinEntrySchema>;

/** The short form every contest payload carries per circle (ContestCircleWeekSchema.coins). */
export const GroupCoinsSummarySchema = z.object({
  /** Capped total (0..GROUP_COINS_CAP). */
  coins: z.number().int(),
  /** GROUP_COINS_CAP, sent so the client never hardcodes it. */
  cap: z.number().int(),
  /** CONTEST_QUALIFY_GROUP_COINS. */
  qualifyAt: z.number().int(),
  /** coins >= qualifyAt. Never returns to false. */
  qualified: z.boolean(),
  /** When the circle first qualified; null until then. */
  qualifiedAt: z.coerce.date().nullable(),
});
export type GroupCoinsSummary = z.infer<typeof GroupCoinsSummarySchema>;

/**
 * The full form the circle coins screen renders (GET /goals/:id/details →
 * `groupPortfolio.groupCoins`, see ./investmentGoalDetails).
 */
export const GroupCoinsSchema = GroupCoinsSummarySchema.extend({
  /** The creation credit has been written. */
  creationCredited: z.boolean(),
  /**
   * False while the circle lacks a name, a target amount > 0 or a target date.
   * The app then shows "complete the circle's name, target and date to earn
   * GROUP_COINS_CREATION_CREDIT coins" with a link to edit the goal.
   */
  creationDetailsComplete: z.boolean(),
  /** Members credited with GROUP_COINS_JOIN_CREDIT so far. */
  joinCredits: z.number().int(),
  /** groupCoinsJoinsToQualify(coins, !creationCredited && !creationDetailsComplete); 0 once qualified. */
  joinsToQualify: z.number().int(),
  entries: z.array(GroupCoinEntrySchema),
});
export type GroupCoins = z.infer<typeof GroupCoinsSchema>;
